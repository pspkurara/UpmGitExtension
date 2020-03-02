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
var npm = __importStar(require("../lib/npm"));
var registry_1 = require("./registry");
var ScopedRegistry = /** @class */ (function (_super) {
    __extends(ScopedRegistry, _super);
    function ScopedRegistry(url, force) {
        return _super.call(this, url, "scoped", force) || this;
    }
    ScopedRegistry.prototype.isUpToDate = function (name, time) {
        if (!name || !time)
            return false;
        var outpath = this.getCacheName(name);
        return utils.isCached(outpath, time);
    };
    ScopedRegistry.prototype.updatePackageCache = function (packageName) {
        return __awaiter(this, void 0, void 0, function () {
            var pkgs, upmPkg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(">>>> Get all package versions: " + packageName);
                        return [4 /*yield*/, npm.getPackageVersions(this.url, packageName)];
                    case 1:
                        pkgs = _a.sent();
                        if (pkgs == null)
                            return [2 /*return*/];
                        upmPkg = pkgs.versions.map(utils.toUpmPackage);
                        this.writeCache(packageName, upmPkg);
                        return [2 /*return*/];
                }
            });
        });
    };
    ScopedRegistry.prototype.updateCacheInternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var names, _i, names_1, _a, name_1, time;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, npm.getAllPackages(this.url)];
                    case 1:
                        names = _b.sent();
                        _i = 0, names_1 = names;
                        _b.label = 2;
                    case 2:
                        if (!(_i < names_1.length)) return [3 /*break*/, 5];
                        _a = names_1[_i], name_1 = _a[0], time = _a[1];
                        // Is the cache of the package up-to-date?
                        if (this.isUpToDate(name_1, time) && !this.force) {
                            console.log(">>>> Skip: '" + name_1 + "' is up-to-date.");
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, this.updatePackageCache(name_1)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ScopedRegistry;
}(registry_1.Registry));
exports.ScopedRegistry = ScopedRegistry;
//# sourceMappingURL=scoped-registry.js.map