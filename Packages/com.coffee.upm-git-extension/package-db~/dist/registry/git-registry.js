"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils = __importStar(require("../lib/utils"));
var git_1 = require("../lib/git");
var registry_1 = require("./registry");
var GitRegistry = /** @class */ (function (_super) {
    __extends(GitRegistry, _super);
    function GitRegistry(url, packageName, force) {
        var _this = _super.call(this, url, "git", force) || this;
        console.log("  -> " + packageName);
        var id = utils.hashCode(url);
        _this.packageName = packageName;
        _this.git = new git_1.Git(url, "Library/UGE/repos/" + id);
        return _this;
    }
    GitRegistry.prototype.getFetchName = function () {
        return this.packageName + "@" + _super.prototype.getFetchName.call(this);
    };
    GitRegistry.prototype.isUpToDate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldHash, newHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(">>>> Fetch repo (fast mode)");
                        return [4 /*yield*/, this.git.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.git.getHash()];
                    case 2:
                        oldHash = _a.sent();
                        return [4 /*yield*/, this.git.fetch()];
                    case 3:
                        newHash = _a.sent();
                        return [2 /*return*/, oldHash == newHash];
                }
            });
        });
    };
    GitRegistry.prototype.updatePackageCache = function (packageName) {
        return __awaiter(this, void 0, void 0, function () {
            var refs, files, versions, i, ref, success, pkg, refName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(">>>> Get refs and all package infos.");
                        return [4 /*yield*/, this.git.showRef()];
                    case 1:
                        refs = _a.sent();
                        files = "package.json package.json.meta";
                        versions = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < refs.length)) return [3 /*break*/, 5];
                        ref = refs[i];
                        console.log("  " + ref);
                        return [4 /*yield*/, this.git.checkout(ref, files)];
                    case 3:
                        success = _a.sent();
                        if (!success)
                            return [3 /*break*/, 4];
                        pkg = utils.loadJson(this.git.cwd + "/package.json");
                        if (pkg == null || (packageName && pkg.name != packageName))
                            return [3 /*break*/, 4];
                        console.log("    OK -> " + pkg.version);
                        refName = ref.split("/").pop() || "";
                        pkg.packageId = packageName + "@" + this.url + "#" + refName;
                        if (pkg.version != refName)
                            pkg.version = pkg.version + "-" + refName;
                        versions.push(utils.toUpmPackage(pkg));
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.writeCache(packageName, versions);
                        return [2 /*return*/];
                }
            });
        });
    };
    GitRegistry.prototype.updateCacheInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isUpToDate()];
                    case 1:
                        if ((_a.sent()) && !this.force) {
                            console.log("  -> Skip: '" + this.packageName + "' is up-to-date.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.updatePackageCache(this.packageName)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GitRegistry;
}(registry_1.Registry));
exports.GitRegistry = GitRegistry;
//# sourceMappingURL=git-registry.js.map