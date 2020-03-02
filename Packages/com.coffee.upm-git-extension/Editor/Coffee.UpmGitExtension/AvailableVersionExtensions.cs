#if IGNORE_ACCESS_CHECKS // [ASMDEFEX] DO NOT REMOVE THIS LINE MANUALLY.
using UnityEngine;
using UnityEditor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Diagnostics;
using System.Text;
using UnityEditor.PackageManager;
#if !UNITY_2019_1_9_OR_NEWER
using Semver;
#endif
#if UNITY_2019_3_OR_NEWER
using Package = UnityEditor.PackageManager.UI.UpmPackage;
using PackageInfo = UnityEditor.PackageManager.UI.UpmPackageVersion;
#else
using Package = UnityEditor.PackageManager.UI.Package;
using PackageInfo = UnityEditor.PackageManager.UI.PackageInfo;
using PackageCollection = UnityEditor.PackageManager.UI.PackageCollection;
#endif

namespace Coffee.UpmGitExtension
{
    public class AvailableVersionExtensions
    {
        const string kCacheDir = "Library/UGE";
        const string kResultDir = kCacheDir + "/cache";
        const string kHeader = "<b><color=#c7634c>[AvailableVersionExtensions]</color></b> ";
        const string kGetVersionsJs = "Packages/com.coffee.upm-git-extension/package-db~/dist/index.js";

        public static void UpdateAvailableVersions(string repoUrl = "", Action<int> callback = null)
        {
            // OFFLINE
            return;

#if UNITY_EDITOR_WIN
            var node = Path.Combine(EditorApplication.applicationContentsPath, "Tools\\nodejs\\node.exe");
#else
            var node = Path.Combine(EditorApplication.applicationContentsPath, "Tools/nodejs/bin/node");
#endif
            var path = !string.IsNullOrEmpty(repoUrl) ? repoUrl : "Packages/manifest.json";
            var args = string.Format("--harmony \"{0}\" \"{1}\"", Path.GetFullPath(kGetVersionsJs), path);
            Debug.Log(kHeader, $"{node} {args}");

            var p = new UnityEditorInternal.NativeProgram(node, args);
            p.Start((_, __) =>
            {
#if UGE_LOG
                UnityEngine.Debug.Log(p.GetAllOutput());
#endif
                if (callback != null)
                    callback(p._process.ExitCode);
            });
        }

        static Dictionary<int, IEnumerable<PackageInfo>> s_CachedVersions = new Dictionary<int, IEnumerable<PackageInfo>>();


        static IEnumerable<PackageInfo> GenerateCache(string json)
        {
            var unityVersion = PackageInfoSummary.ParseVersion(Application.unityVersion);
            var cache = Json.Deserialize(json) as Dictionary<string, object>;
            var availableVersions = new HashSet<string>(
                (cache["versions"] as List<object>)
                    .OfType<Dictionary<string, object>>()
                    .Where(v=>PackageInfoSummary.ParseVersion(v["m_Unity"] as string) <= unityVersion)
                    .Select(v=>v["m_Version"] as string)
            );

            var pinf = JsonUtility.FromJson<PackageCache>(json);
            pinf.versions = pinf.versions
                .Where(x => availableVersions.Contains(x.version))
                .OrderByDescending(x => SemVersion.Parse(x.version))
                .ToArray();
            
            if (pinf.versions.Length == 0)
                return new PackageInfo[0];
            
            var latest = pinf.versions[0];
            var all = pinf.versions.Select(x => x.version).ToArray();
            latest.m_Versions = new VersionsInfo(all, all, latest.version);

#if UNITY_2019_3_OR_NEWER
            return UnityEditor.PackageManager.UI.UpmBaseOperation.FromUpmPackageInfo(latest, false);
#else
            return UnityEditor.PackageManager.UI.UpmBaseOperation.FromUpmPackageInfo(latest, false);
#endif
        }

        static void OnResultCreated(string file)
        {
            if (string.IsNullOrEmpty(file) || !file.EndsWith(".git.json") || !File.Exists(file))
                return;
            
            // The package is installed?
            var packageName = Path.GetFileName(file).Split('@')[0];
            var package = PackageExtensions.GetGitPackages()
                .FirstOrDefault(p=>p.GetName() == packageName);
            
            if (package == null)
                return;
            
            // Get/generate cached versions. 
            var text = File.ReadAllText(file, System.Text.Encoding.UTF8);
            var hashCode = text.GetHashCode();
            IEnumerable<PackageInfo> versions;
            if(!s_CachedVersions.TryGetValue(hashCode, out versions))
            {
                // Generate.
                versions = GenerateCache(text);
                s_CachedVersions.Add(hashCode, versions);
            }

            // Update package's available versions.
            var current = package.GetInstalledVersion();
            versions = versions.Where(v=>v.GetVersion() != current.GetVersion())
                        .Concat(new []{current})
                        .ToArray();
            package.UpdateVersions(versions);
        }

        [MenuItem("UGE/test UpdatePackageCollection")]
        static void test2()
        {
            PackageExtensions.UpdatePackageCollection();
        }

        [MenuItem("UGE/test OnResultCreated All")]
        static void test()
        {
            foreach(var p in PackageExtensions.GetGitPackages())
            {
                UnityEngine.Debug.Log($"{p.GetName()}");
            }

            var resultDir = Path.GetFullPath(kResultDir);
            Debug.Log(kHeader, $"Start to watch .json in {resultDir}");
            if (!Directory.Exists(resultDir))
                Directory.CreateDirectory(resultDir);

            foreach (var file in Directory.GetFiles(resultDir, "*.git.json"))
                EditorApplication.delayCall += () => OnResultCreated(file);
        }

        [InitializeOnLoadMethod]
        static void WatchResultJson()
        {
            Debug.Log(kHeader, $"Start to watch .json in {kResultDir}");

#if !UNITY_EDITOR_WIN
            Environment.SetEnvironmentVariable("MONO_MANAGED_WATCHER", "enabled");
#endif
            var resultDir = Path.GetFullPath(kResultDir);
            Debug.Log(kHeader, $"Start to watch .json in {resultDir}");
            if (!Directory.Exists(resultDir))
                Directory.CreateDirectory(resultDir);

            foreach (var file in Directory.GetFiles(resultDir, "*.git.json"))
                EditorApplication.delayCall += () => OnResultCreated(file);

            var watcher = new FileSystemWatcher()
            {
                Path = resultDir,
                NotifyFilter = NotifyFilters.LastWrite,
                IncludeSubdirectories = false,
                EnableRaisingEvents = true,
            };

            watcher.Created += (s, e) =>
            {
                EditorApplication.delayCall += () => OnResultCreated(e.Name);
            };
        }
    }
}
#endif // [ASMDEFEX] DO NOT REMOVE THIS LINE MANUALLY.