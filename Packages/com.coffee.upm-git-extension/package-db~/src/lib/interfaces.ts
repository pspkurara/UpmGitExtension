export interface Manifest {
  scopedRegistries?: { name: string; url: string; scopes: string[] }[];
  dependencies?: { [key: string]: string };
}

export interface NpmPackage {
  packageId?: string;
  name: string;
  version: string;
  displayName?: string;
  unity: string;
  unityRelease?: string;
  description?: string;
  category?: string;
  type?: string;
  keywords?: string[];
  dependencies?: { [key: string]: string };
}

export interface NpmPackageVersions {
  name: string;
  versions: NpmPackage[];
}

export interface DependencyInfo {
  m_Name: string;
  m_Version: string;
}

export interface UpmPackge {
  m_PackageId: string;
  m_Name: string;
  m_Version: string;
  m_Unity: string;
  m_Source: number;
  m_Status: number;
  m_DisplayName?: string;
  m_Description?: string;
  m_Category?: string;
  m_Type?: string;
  m_Keywords?: string[];
  m_Dependencies?: DependencyInfo[];
}

export interface UpmPackgeCache {
  name: string;
  url: string;
  versions: UpmPackge[];
}

export interface Context {
  unityVersion: string;
  outpath: string;
  registoryUrl: string;
  resultDir: string;
}
