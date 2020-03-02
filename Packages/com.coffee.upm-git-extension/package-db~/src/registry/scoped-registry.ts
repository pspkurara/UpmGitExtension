import * as utils from "../lib/utils";
import * as npm from "../lib/npm";
import { Registry } from "./registry";

export class ScopedRegistry extends Registry {
  constructor(url: string, force: boolean) {
    super(url, "scoped", force);
  }

  private isUpToDate(name: string, time: number): boolean {
    if (!name || !time) return false;

    const outpath = this.getCacheName(name);
    return utils.isCached(outpath, time);
  }

  protected async updatePackageCache(packageName: string): Promise<void> {
    console.log(`>>>> Get all package versions: ${packageName}`);
    const pkgs = await npm.getPackageVersions(this.url, packageName);
    if (pkgs == null) return;

    const upmPkg = pkgs.versions.map(utils.toUpmPackage);
    this.writeCache(packageName, upmPkg);
  }

  protected async updateCacheInternal(): Promise<void> {
    const names = await npm.getAllPackages(this.url);
    for (const [name, time] of names) {
      // Is the cache of the package up-to-date?
      if (this.isUpToDate(name, time) && !this.force) {
        console.log(`>>>> Skip: '${name}' is up-to-date.`);
        continue;
      }
      await this.updatePackageCache(name);
    }
  }
}
