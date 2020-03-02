import * as utils from "../lib/utils";
import { UpmPackge } from "../lib/interfaces";

export abstract class Registry {
  url: string;
  name: string;
  force: boolean;

  constructor(url: string, name: string, force: boolean) {
    this.url = url;
    this.name = name;
    this.force = force;
    console.log(`[ Registry (${name}) ] Created. url: ${url}`);
  }

  protected getCoolTime(): number {
    return Date.now() - 1000 * 60 * 5;
  }

  protected isCoolTime(): boolean {
    return utils.isCached(this.getFetchName(), this.getCoolTime());
  }

  protected setCoolTime(): void {
    utils.writeCache({}, this.getFetchName(), true);
  }

  protected getFetchName(): string {
    const hash = utils.hashCode(this.url);
    return `${hash}.${this.name}.fetch`;
  }

  protected getCacheName(packageName: string): string {
    const hash = utils.hashCode(this.url);
    return `${packageName}@${hash}.${this.name}.json`;
  }

  protected writeCache(packageName: string, versions: UpmPackge[]): void {
    const obj = { name: packageName, url: this.url, versions };
    const outpath = this.getCacheName(packageName);
    console.log(`  ${packageName} has ${versions.length} versions.`);
    console.log(`  -> Save cache: ${outpath}`);
    utils.writeCache(obj, outpath, this.force);
  }

  async updateCache(): Promise<void> {
    if (!this.force && this.isCoolTime()) {
      console.log(`  -> Skip: Cool time`);
      return;
    }

    await this.updateCacheInternal();
    this.setCoolTime();
  }

  protected abstract async updateCacheInternal(): Promise<void>;
  protected abstract async updatePackageCache(
    packageName: string
  ): Promise<void>;
}
