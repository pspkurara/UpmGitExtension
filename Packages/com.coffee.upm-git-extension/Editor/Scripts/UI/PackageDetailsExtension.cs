#if OPEN_SESAME // This line is added by Open Sesame Portable. DO NOT remov manually.
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using UnityEditor;
using UnityEditor.PackageManager;
// using UnityEditor.PackageManager.UI.InternalBridge;
using UnityEngine;
#if UNITY_2019_1_OR_NEWER
using UnityEngine.UIElements;
#else
using UnityEngine.Experimental.UIElements;
#endif
using PackageInfo = UnityEditor.PackageManager.PackageInfo;
// using Debug = UnityEditor.PackageManager.UI.InternalBridge.Debug;
using UnityEditor.PackageManager.UI;
using System.IO;
using System;
// using UIUtils = UnityEditor.PackageManager.UI.InternalBridge.UIUtils;
// using UIUtils = UnityEditor.PackageManager.UI.UIUtils;

namespace Coffee.PackageManager.UI
{
    internal class PackageDetailsExtension
    {
        //################################
        // Constant or Static Members.
        //################################
        const string kHeader = "<b><color=#c7634c>[PackageDetailsExtension]</color></b> ";

        //################################
        // Public Members.
        //################################
        public void Setup(VisualElement root)
        {
            this.root = root;
            this.packageDetails = root.Q<PackageDetails>();

            Debug.Log(kHeader, "[InitializeUI] Setup host button:");
            var hostButton = root.Q<Button>("hostButton");
            if (hostButton == null)
            {
                hostButton = new Button(ViewRepoClick) { name = "hostButton", tooltip = "View on browser" };
                hostButton.RemoveFromClassList("unity-button");
                hostButton.RemoveFromClassList("button");
                hostButton.AddToClassList("link");
                hostButton.style.marginRight = 2;
                hostButton.style.marginLeft = 2;
                hostButton.style.width = 16;
                hostButton.style.height = 16;
                root.Q("detailVersion").parent.Add(hostButton);

#if !UNITY_2019_1_OR_NEWER
                hostButton.style.sliceBottom = 0;
                hostButton.style.sliceTop = 0;
                hostButton.style.sliceRight = 0;
                hostButton.style.sliceLeft = 0;
#endif
            }


#if UNITY_2018
            Debug.Log(kHeader, "[InitializeUI] Setup document actions:");
            root.Q<Button>("viewDocumentation").OverwriteCallback(ViewDocClick);
            root.Q<Button>("viewChangelog").OverwriteCallback(ViewChangelogClick);
            root.Q<Button>("viewLicenses").OverwriteCallback(ViewLicensesClick);
#endif

            Debug.Log(kHeader, "[InitializeUI] Setup update button:");
            var updateButton = root.Q<Button>("update");
            updateButton.OverwriteCallback(UpdateClick);

            Debug.Log(kHeader, "[InitializeUI] Setup remove button:");
            var removeButton = root.Q<Button>("remove");
            removeButton.OverwriteCallback(RemoveClick);
        }


        /// <summary>
        /// Called by the Package Manager UI when the package selection changed.
        /// </summary>
        /// <param name="packageInfo">The newly selected package information (can be null)</param>
        public void OnPackageSelectionChange(PackageInfo packageInfo)
        {
            if (packageInfo == null)
                return;

            if (packageInfo.source == PackageSource.Git)
            {
                // Show remove button for git package.
                var removeButton = root.Q<Button>("remove");
                UIUtils.SetElementDisplay(removeButton, true);
                removeButton.SetEnabled(true);

                // Show git tag.
                var tagGit = root.Q("tag-git");
                UIUtils.SetElementDisplay(tagGit, true);
            }

            // Show hosting service logo.
            var host = Settings.GetHostData(packageInfo.packageId);
            var hostButton = root.Q<Button>("hostButton");
            hostButton.style.backgroundImage = host.Logo;
            hostButton.visible = packageInfo.source == PackageSource.Git;
        }


        //################################
        // Private Members.
        //################################
        VisualElement root;
        PackageDetails packageDetails;

#if UNITY_2019_3_OR_NEWER
        UnityEditor.PackageInfo GetSelectedPackage() { return GetSelectedVersion().packageInfo; }
        UpmPackageVersion GetSelectedVersion() { return packageDetails.TargetVersion; }
#elif UNITY_2019_1_OR_NEWER
        UnityEditor.PackageManager.PackageInfo GetSelectedPackage() { return GetSelectedVersion().Info; }
        UnityEditor.PackageManager.UI.PackageInfo GetSelectedVersion() { return packageDetails.TargetVersion; }
#else
        UnityEditor.PackageManager.PackageInfo GetSelectedPackage() { return GetSelectedVersion().Info; }
        UnityEditor.PackageManager.UI.PackageInfo GetSelectedVersion() { return packageDetails.SelectedPackage; }
#endif

        /// <summary>
        /// On click 'Update package' callback.
        /// </summary>
        public void UpdateClick()
        {
            Debug.Log(kHeader, "[UpdateClick]");
            var selectedPackage = GetSelectedPackage();
            if (selectedPackage.source == PackageSource.Git)
            {
                string packageId = selectedPackage.packageId;
                string url = PackageUtils.GetRepoUrl(packageId);
#if UNITY_2019_3_OR_NEWER
                string refName = GetSelectedVersion().packageInfo.git.revision;
#else
                string refName = GetSelectedVersion().VersionId.Split('@')[1];
#endif
                PackageUtils.UninstallPackage(selectedPackage.name);
                PackageUtils.InstallPackage(selectedPackage.name, url, refName);
            }
            else
            {
                packageDetails.UpdateClick();
            }
        }

        /// <summary>
        /// On click 'Remove package' callback.
        /// </summary>
        public void RemoveClick()
        {
            Debug.Log(kHeader, "[RemoveClick]");
            var selectedPackage = GetSelectedPackage();
            if (selectedPackage.source == PackageSource.Git)
            {
                PackageUtils.UninstallPackage(selectedPackage.name);
            }
            else
            {
                packageDetails.RemoveClick();
            }
        }

        /// <summary>
        /// On click 'View repository' callback.
        /// </summary>
        public void ViewRepoClick()
        {
            Application.OpenURL(PackageUtils.GetRepoUrl(GetSelectedPackage().packageId, true));
        }

#if UNITY_2018
        public void ViewDocClick()
        {
            var packageInfo = GetSelectedPackage();
            if (packageInfo.source == PackageSource.Git)
            {
                var docsFolder = Path.Combine(packageInfo.resolvedPath, "Documentation~");
                if (!Directory.Exists(docsFolder))
                    docsFolder = Path.Combine(packageInfo.resolvedPath, "Documentation");
                if (Directory.Exists(docsFolder))
                {
                    var mdFiles = Directory.GetFiles(docsFolder, "*.md", SearchOption.TopDirectoryOnly);
                    var docsMd = mdFiles.FirstOrDefault(d => Path.GetFileName(d).ToLower() == "index.md")
                        ?? mdFiles.FirstOrDefault(d => Path.GetFileName(d).ToLower() == "tableofcontents.md") ?? mdFiles.FirstOrDefault();
                    if (!string.IsNullOrEmpty(docsMd))
                    {
                        Application.OpenURL(new Uri(docsMd).AbsoluteUri);
                        return;
                    }
                }
            }
            packageDetails.ViewDocClick();
        }

        public void ViewChangelogClick()
        {
            var packageInfo = GetSelectedPackage();
            if (packageInfo.source == PackageSource.Git)
            {
                var changelogFile = Path.Combine(packageInfo.resolvedPath, "CHANGELOG.md");
                if (File.Exists(changelogFile))
                {
                    Application.OpenURL(new Uri(changelogFile).AbsoluteUri);
                    return;
                }
            }
            packageDetails.ViewChangelogClick();
        }

        public void ViewLicensesClick()
        {
            var packageInfo = GetSelectedPackage();
            if (packageInfo.source == PackageSource.Git)
            {
                var licenseFile = Path.Combine(packageInfo.resolvedPath, "LICENSE.md");
                if (File.Exists(licenseFile))
                {
                    Application.OpenURL(new Uri(licenseFile).AbsoluteUri);
                    return;
                }
            }
            packageDetails.ViewLicensesClick();
        }
#endif
    }
}
#endif // This line is added by Open Sesame Portable. DO NOT remov manually.