#if IGNORE_ACCESS_CHECKS // [ASMDEFEX] DO NOT REMOVE THIS LINE MANUALLY.
using UnityEngine;
using UnityEditor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

#if !UNITY_2019_1_9_OR_NEWER
using Semver;
#endif

namespace Coffee.UpmGitExtension
{
    [Serializable]
    public class AvailableVersion : IEquatable<AvailableVersion>
    {
        public string packageName = "";
        public string version = "";
        public string refName = "";
        public string repoUrl = "";

        public string refNameText { get { return version == refName ? version : version + " - " + refName; } }
        public string refNameVersion { get { return version == refName ? version : version + "-" + refName; } }

        bool IEquatable<AvailableVersion>.Equals(AvailableVersion other)
        {
            return other != null
                && packageName == other.packageName
                && version == other.version
                && repoUrl == other.repoUrl
                && refName == other.refName;
        }

        public override int GetHashCode()
        {
            return packageName.GetHashCode()
                + version.GetHashCode()
                + repoUrl.GetHashCode()
                + refName.GetHashCode();
        }
    }


    [Serializable]
    public class PackageInfoSummary
    {
        static readonly Dictionary<string, ulong> s_VersionMap = new Dictionary<string, ulong>();
        static readonly uint[] s_VersionMultiplier = new uint[] { 100000000, 1000000, 10000, 100, 1 };
        static readonly Regex s_RegUnityVersion = new Regex("(\\d+).(\\d+).(\\d+)([^\\d]+)(\\d+)", RegexOptions.Compiled);
        public string m_Name = "none";
        public string m_Version = "1.0.0";
        public string m_Unity = "2018.3";
        public string m_UnityRelease = "0a0";
        public string unityVersion => $"{m_Unity}.{m_UnityRelease}";
        public bool isSupported => ParseVersion(unityVersion) < ParseVersion(Application.unityVersion);

        public static ulong ParseVersion(string unityVersion)
        {
            ulong val;
            if (s_VersionMap.TryGetValue(unityVersion, out val))
                return val;

            var c = s_RegUnityVersion.Match(unityVersion);
            if (!c.Success)
            {
                s_VersionMap.Add(unityVersion, 0);
                return 0;
            }

            val = c.Groups.Cast<Capture>()
                .Skip(1)
                .Select((x, i) =>
                {
                    ulong r;
                    if (!ulong.TryParse(x.Value, out r))
                        r = (uint)(x.Value.ToLower()[0] - 'a');
                    return r * s_VersionMultiplier[i];
                })
                .Aggregate((a, b) => a + b);

            s_VersionMap.Add(unityVersion, val);
            return val;
        }
    }

    [Serializable]
    public class PackageCacheSummary
    {
        public string name;
        public PackageInfoSummary[] versions;
        public override int GetHashCode()
        {
            return JsonUtility.ToJson(this).GetHashCode();
        }
    }

    [Serializable]
    public class PackageCache
    {
        public string name;
        public int hashCode;
        public UnityEditor.PackageManager.PackageInfo[] versions;
    }

    [Serializable]
    public class ResultInfo
    {
        public AvailableVersion[] versions;
    }

    public class AvailableVersions : ScriptableSingleton<AvailableVersions>
    {
        const string kPackageDir = "Library/UGE/packages";

        public AvailableVersion[] versions = new AvailableVersion[0];
        
        public static event Action OnChanged = () => { };

        public static void ClearAll()
        {
            instance.versions = new AvailableVersion[0];

            if (Directory.Exists(kPackageDir))
                Directory.Delete(kPackageDir, true);
        }

        public static void Clear(string packageName = null, string repoUrl = null)
        {
            instance.versions = instance.versions
                .Where(x => string.IsNullOrEmpty(packageName) || x.packageName != packageName)
                .Where(x => string.IsNullOrEmpty(repoUrl) || x.repoUrl != repoUrl)
                .ToArray();
        }

        public static IEnumerable<AvailableVersion> GetVersions(string packageName = null, string repoUrl = null)
        {
            return instance.versions
                .Where(x => string.IsNullOrEmpty(packageName) || x.packageName == packageName)
                .Where(x => string.IsNullOrEmpty(repoUrl) || x.repoUrl == repoUrl);
        }

        public static void Dump()
        {
            var sb = new StringBuilder("[AvailableVersions] Dump:\n");
            foreach(var v in instance.versions.OrderBy(x=>x.packageName).ThenBy(x=>x.version))
            {
                sb.AppendLine(JsonUtility.ToJson(v));
            }
            UnityEngine.Debug.Log(sb);
        }

        public static void AddVersions(IEnumerable<AvailableVersion> add)
        {
            if (add == null || !add.Any())
                return;

            var length = instance.versions.Length;
            var versions = instance.versions
                .Union(add)
                .ToArray();

            if (versions.Length != length)
            {
                instance.versions = versions;
                OnChanged();
            }
        }
    }
}
#endif // [ASMDEFEX] DO NOT REMOVE THIS LINE MANUALLY.