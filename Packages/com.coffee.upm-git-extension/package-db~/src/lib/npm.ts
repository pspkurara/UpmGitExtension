import https from "https";
import { NpmPackage, NpmPackageVersions } from "./interfaces";

async function httpsGet(url: string): Promise<object> {
  return new Promise((resolve, reject) => {
    https
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .get(url, (res: any) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => (body += chunk));
        res.on("end", () => resolve(JSON.parse(body)));
      })
      .on("error", (err: Error) => reject(err));
  });
}

/**
 * Get all package names and modification times (UTC).
 * @param url - The url of the npm registry.
 */
export async function getAllPackages(url: string): Promise<[string, number][]> {
  try {
    const all = await httpsGet(`${url}/-/all`);
    return Object.values(all)
      .filter(p => p.name && p.time)
      .map(p => [p.name, Date.parse(p.time.modified)]);
  } catch {
    return [];
  }
}

/**
 * Get all versions of the package in registry.
 * @param url  - The url of the npm registry.
 * @param packageName - The name of the package.
 */
export async function getPackageVersions(
  url: string,
  packageName: string
): Promise<NpmPackageVersions | null> {
  try {
    const p = (await httpsGet(`${url}/${packageName}`)) as {
      name: string;
      versions: object;
    };
    const versions = Object.values(p.versions) as NpmPackage[];
    return { name: p.name, versions };
  } catch {
    return null;
  }
}
