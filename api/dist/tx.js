"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var ibis_lib_1 = require("ibis-lib");
var config_1 = __importDefault(require("./config"));
var express_1 = __importDefault(require("express"));
var file_1 = __importDefault(require("./file"));
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var router = express_1.default.Router();
var allInfo = function () { return __awaiter(_this, void 0, void 0, function () {
    var items, dirs, listing;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                items = fs_1.default.readdirSync(config_1.default.paths.tx);
                dirs = items.filter(function (item) { return fs_1.default.statSync(path_1.join(config_1.default.paths.tx, item)).isDirectory(); });
                return [4 /*yield*/, Promise.all(dirs.map(function (dir) { return __awaiter(_this, void 0, void 0, function () {
                        var items, infos, _a;
                        var _this = this;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                        var _this = this;
                                        return __generator(this, function (_a) {
                                            fs_1.default.readdir(path_1.join(config_1.default.paths.tx, dir), function (err, items) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    if (err)
                                                        return [2 /*return*/, reject(err)];
                                                    resolve(items);
                                                    return [2 /*return*/];
                                                });
                                            }); });
                                            return [2 /*return*/];
                                        });
                                    }); })];
                                case 1:
                                    items = _b.sent();
                                    infos = items.map(function (item) { return ibis_lib_1.parseHeaderFromFile(path_1.join(config_1.default.paths.tx, dir, item)); });
                                    _a = {
                                        modality: dir
                                    };
                                    return [4 /*yield*/, Promise.all(infos)];
                                case 2: return [2 /*return*/, (_a.treatments = _b.sent(),
                                        _a)];
                            }
                        });
                    }); }))];
            case 1:
                listing = _a.sent();
                return [2 /*return*/, listing];
        }
    });
}); };
router.get("/treatments", function (_, res) {
    allInfo().then(function (treatmentListing) {
        res.send([].concat.apply([], treatmentListing.map(function (t) { return t.treatments; })));
    });
});
router.use("/", file_1.default({
    endpoint: "tx",
    absoluteFilePath: config_1.default.relative.ibisRoot("system", "tx")
}));
exports.default = router;
//# sourceMappingURL=tx.js.map