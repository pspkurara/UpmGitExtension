import { ManifestRegistry } from "./registry/manifest-registry";
import { GitRegistry } from "./registry/git-registry";

const filepath = process.argv[2];
const force = Boolean(process.argv[3]);
const isManifest = filepath.endsWith("Packages/manifest.json");

async function main(): Promise<void> {
  if (isManifest) await new ManifestRegistry(filepath, force).updateCache();
  else await new GitRegistry(filepath, "", force).updateCache();

  console.log("\n#### COMPLETE ####");
}

main();
