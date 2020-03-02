import * as utils from "../lib/utils";
import { Git } from "../lib/git";
import { UpmPackge, NpmPackage } from "../lib/interfaces";
import { Registry } from "./registry";

export class GitRegistry extends Registry {
  private packageName: string;
  private git: Git;

  constructor(url: string, packageName: string, force: boolean) {
    super(url, "git", force);
    console.log(`  -> ${packageName}`);

    const id = utils.hashCode(url);
    this.packageName = packageName;
    this.git = new Git(url, `Library/UGE/repos/${id}`);
  }

  protected getFetchName(): string {
    return `${this.packageName}@${super.getFetchName()}`;
  }

  private async isUpToDate(): Promise<boolean> {
    console.log(`>>>> Fetch repo (fast mode)`);
    await this.git.init();
    const oldHash = await this.git.getHash();
    const newHash = await this.git.fetch();

    return oldHash == newHash;
  }

  protected async updatePackageCache(packageName: string): Promise<void> {
    console.log(">>>> Get refs and all package infos.");
    const refs = await this.git.showRef();
    const files = "package.json package.json.meta";
    const versions: UpmPackge[] = [];
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      console.log(`  ${ref}`);
      const success = await this.git.checkout(ref, files);
      if (!success) continue;

      const pkg = utils.loadJson<NpmPackage>(`${this.git.cwd}/package.json`);
      if (pkg == null || (packageName && pkg.name != packageName)) continue;

      console.log(`    OK -> ${pkg.version}`);
      const refName = ref.split("/").pop() || "";
      pkg.packageId = `${packageName}@${this.url}#${refName}`;
      if (pkg.version != refName) pkg.version = pkg.version + "-" + refName;

      versions.push(utils.toUpmPackage(pkg));
    }

    this.writeCache(packageName, versions);
  }

  protected async updateCacheInternal(): Promise<void> {
    if ((await this.isUpToDate()) && !this.force) {
      console.log(`  -> Skip: '${this.packageName}' is up-to-date.`);
      return;
    }

    await this.updatePackageCache(this.packageName);
  }
}
