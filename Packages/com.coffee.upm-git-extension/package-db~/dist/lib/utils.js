"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/camelcase */
var fs_1 = __importDefault(require("fs"));
var cacheDir = "Library/UGE/cache";
function hashCode(v) {
    return Array.from(v).reduce(function (s, c) { return (Math.imul(31, s) + c.charCodeAt(0)) | 0; }, 0);
}
exports.hashCode = hashCode;
function mkdir(path) {
    if (fs_1.default.existsSync(path))
        return;
    path.split("/").reduce(function (acc, item) {
        var currentPath = item ? (acc ? [acc, item].join("/") : item) : "";
        if (currentPath && !fs_1.default.existsSync(currentPath)) {
            fs_1.default.mkdirSync(currentPath);
        }
        return currentPath;
    }, "");
}
exports.mkdir = mkdir;
function loadJson(path) {
    if (!fs_1.default.existsSync(path))
        return null;
    try {
        var json = fs_1.default.readFileSync(path, "utf8");
        return JSON.parse(json);
    }
    catch (_a) {
        return null;
    }
}
exports.loadJson = loadJson;
/**
 * Create a new cache file.
 * @param obj - The object to cache.
 * @param filename - Cache file name.
 * @param force - Create a new cache file without any changes.
 */
function writeCache(obj, filename, force) {
    if (force === void 0) { force = false; }
    mkdir(cacheDir);
    var filepath = cacheDir + "/" + filename;
    var json = JSON.stringify(obj, undefined, 2);
    // Do not write if there is no change.
    if (!force && fs_1.default.existsSync(filepath)) {
        var oldJson = fs_1.default.readFileSync(filepath, "utf-8");
        if (hashCode(oldJson) == hashCode(json)) {
            console.log("  -> Skip: " + filename + " has no changes.");
            return;
        }
    }
    fs_1.default.writeFileSync(cacheDir + "/" + filename, json, "utf-8");
}
exports.writeCache = writeCache;
/**
 * Returns whether a valid cache file exists.
 * @param  filename - Cache file name.
 * @param  atleast - Expiration date of the cache. If not specified, 5 minutes before the current time.
 * @returns Returns `true` if a valid cache file exists; otherwise` false`.
 */
function isCached(filename, atleast) {
    var path = cacheDir + "/" + filename;
    if (!fs_1.default.existsSync(path))
        return false;
    var mtime = fs_1.default.statSync(path).mtime.getTime();
    return atleast < mtime;
}
exports.isCached = isCached;
function toDependencyInfo(dep) {
    return { m_Name: dep[0], m_Version: dep[1] };
}
function toUpmPackage(pkg) {
    var dependencies = Object.entries(pkg.dependencies || {}).map(toDependencyInfo);
    return {
        m_PackageId: pkg.packageId || pkg.name + "@" + pkg.version,
        m_Name: pkg.name,
        m_Version: pkg.version,
        m_Unity: pkg.unity + "." + (pkg.unityRelease || "0a0"),
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
exports.toUpmPackage = toUpmPackage;
//# sourceMappingURL=utils.js.map