/* eslint-disable @typescript-eslint/camelcase */
import fs from "fs";
import { NpmPackage, UpmPackge, DependencyInfo } from "./interfaces";
const cacheDir = `Library/UGE/cache`;

export function hashCode(v: string): number {
  return Array.from(v).reduce(
    (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
    0
  );
}

export function mkdir(path: string): void {
  if (fs.existsSync(path)) return;

  path.split("/").reduce((acc, item) => {
    const currentPath = item ? (acc ? [acc, item].join("/") : item) : "";
    if (currentPath && !fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    return currentPath;
  }, "");
}

export function loadJson<T>(path: string): T | null {
  if (!fs.existsSync(path)) return null;

  try {
    const json: string = fs.readFileSync(path, "utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Create a new cache file.
 * @param obj - The object to cache.
 * @param filename - Cache file name.
 * @param force - Create a new cache file without any changes.
 */
export function writeCache(obj: object, filename: string, force = false): void {
  mkdir(cacheDir);
  const filepath = `${cacheDir}/${filename}`;
  const json = JSON.stringify(obj, undefined, 2);

  // Do not write if there is no change.
  if (!force && fs.existsSync(filepath)) {
    const oldJson = fs.readFileSync(filepath, "utf-8");
    if (hashCode(oldJson) == hashCode(json)) {
      console.log(`  -> Skip: ${filename} has no changes.`);

      return;
    }
  }

  fs.writeFileSync(`${cacheDir}/${filename}`, json, "utf-8");
}

/**
 * Returns whether a valid cache file exists.
 * @param  filename - Cache file name.
 * @param  atleast - Expiration date of the cache. If not specified, 5 minutes before the current time.
 * @returns Returns `true` if a valid cache file exists; otherwise` false`.
 */
export function isCached(filename: string, atleast: number): boolean {
  const path = `${cacheDir}/${filename}`;
  if (!fs.existsSync(path)) return false;

  const mtime = fs.statSync(path).mtime.getTime();
  return atleast < mtime;
}

function toDependencyInfo(dep: [string, string]): DependencyInfo {
  return { m_Name: dep[0], m_Version: dep[1] };
}

export function toUpmPackage(pkg: NpmPackage): UpmPackge {
  const dependencies: DependencyInfo[] = Object.entries(
    pkg.dependencies || {}
  ).map(toDependencyInfo);

  return {
    m_PackageId: pkg.packageId || `${pkg.name}@${pkg.version}`,
    m_Name: pkg.name,
    m_Version: pkg.version,
    m_Unity: `${pkg.unity}.${pkg.unityRelease || "0a0"}`,
    m_Source: 1,
    m_DisplayName: pkg.displayName,
    m_Category: pkg.category,
    m_Type: pkg.type,
    m_Description: pkg.description,
    m_Status: 4,
    m_Dependencies: dependencies,
    // m_Versions: {
    //   m_All: [pkg.version],
    //   m_Compatible: [pkg.version],
    //   m_Recommended: pkg.version,
    //   m_Verified: pkg.version
    // },
    m_Keywords: pkg.keywords
  };
}
