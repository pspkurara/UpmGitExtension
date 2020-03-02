import { loadJson } from "../lib/utils";
import { Manifest } from "../lib/interfaces";
import { Registry } from "./registry";
import { GitRegistry } from "./git-registry";
// import { ScopedRegistry } from "./scoped-registry";

export class ManifestRegistry extends Registry {
  constructor(path: string, force: boolean) {
    super(path, "manifest", force);
  }

  protected getCoolTime(): number {
    return Date.now();
  }

  async updateCacheInternal(): Promise<void> {
    const manifest = loadJson<Manifest>(this.url);
    if (manifest == null) return Promise.reject();

    // [IGNORED]
    // const scopedUrls = manifest.scopedRegistries?.map(s => s.url) || [];
    // for (const url of scopedUrls) {
    //   await new ScopedRegistry(url, this.force).updateCache();
    // }

    const dependencies = Object.entries(manifest.dependencies || {});
    for (const [name, reference] of dependencies) {
      const match = reference.match(/(^(git|ssh|http)[^#]*)(#[^?]+)?(\?.*)?/);
      if (match == null) continue;

      await new GitRegistry(match[1], name, this.force).updateCache();
    }

    console.log(`\n#### Complete`);
  }

  protected updatePackageCache(packageName: string): Promise<void> {
    throw new Error(`Method not implemented. ${packageName}`);
  }
}
