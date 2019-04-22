"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var ibis_lib_1 = require("ibis-lib");
var path_1 = require("path");
var config_1 = __importStar(require("./config"));
var file_1 = require("./file");
var BetterFileAsync_1 = __importDefault(require("./BetterFileAsync"));
var express_1 = __importDefault(require("express"));
var fuse_js_1 = __importDefault(require("fuse.js"));
var lowdb_1 = __importDefault(require("lowdb"));
var adapter = new BetterFileAsync_1.default(path_1.join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
});
function database() {
    return lowdb_1.default(adapter);
}
var modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g;
function query(text) {
    var result = {
        text: text
    };
    var matches = text.match(modalityPattern);
    if (matches !== null) {
        if (matches.length > 1) {
            throw new Error("multiple modality codes not allowed");
        }
        var matchedModality = modalityPattern.exec(text)[1];
        result.modality = matchedModality.replace(/[""]/g, "");
    }
    return result;
}
exports.query = query;
function searchOptions(options) {
    return function (query, data) {
        if (!data) {
            return [];
        }
        var values = Array.from(data);
        var search = new fuse_js_1.default(values, __assign({ shouldSort: true, threshold: 0.25, location: 0, distance: 50, maxPatternLength: 32, minMatchCharLength: 1 }, options));
        var results = search.search(query);
        if ("matches" in results) {
            return results;
        }
        else {
            return results;
        }
    };
}
var searchDirectory = searchOptions({
    keys: ["header", "header.name"]
});
function getAllListings(resourcePrefix, abs) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (_b = (_a = []).concat).apply;
                    _d = [_a];
                    return [4 /*yield*/, Promise.all(Object.keys(ibis_lib_1.modalities).map(function (modality) { return __awaiter(_this, void 0, void 0, function () {
                            var listing, fileInfos;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.debug("getting", abs, modality);
                                        return [4 /*yield*/, file_1.getListing(abs, modality)];
                                    case 1:
                                        listing = _a.sent();
                                        return [4 /*yield*/, file_1.getFileInfo(abs, modality, listing)];
                                    case 2:
                                        fileInfos = _a.sent();
                                        console.debug("done", abs, modality);
                                        return [2 /*return*/, fileInfos.map(function (f) { return (__assign({}, f, { url: resourcePrefix + "/" + modality + "/" + f.filename, modality: ibis_lib_1.getModality(modality) })); })];
                                }
                            });
                        }); }))];
                case 1: return [2 /*return*/, _c.apply(_b, _d.concat([_e.sent()]))];
            }
        });
    });
}
var router = express_1.default.Router();
router.get("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, db, t, d;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, database()];
            case 1:
                db = _b.sent();
                if (!req.query.q) {
                    res.send(db.value());
                    return [2 /*return*/];
                }
                t = db.get("treatments");
                d = db.get("diseases");
                res.send(searchDirectory(req.query.q, (_a = []).concat.apply(_a, t.value().concat(d.value()))));
                return [2 /*return*/];
        }
    });
}); });
function formatSearchResponse(query, directory, results, categorize) {
    if (categorize === void 0) { categorize = false; }
    if (categorize) {
        return ({
            query: query,
            directory: directory,
            results: results.reduce(function (acc, cur) {
                var name = cur.modality.data.displayName;
                if (!(name in acc)) {
                    acc[name] = {
                        name: name,
                        results: [cur]
                    };
                }
                else {
                    acc[name].results.push(cur);
                }
                return acc;
            }, {})
        });
    }
    else {
        return ({
            query: query,
            directory: directory,
            results: results
        });
    }
}
router.get("/:sub", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var sub, db, _a, q, categorize, _categorize, values, results;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                sub = req.params.sub;
                return [4 /*yield*/, database()];
            case 1:
                db = _b.sent();
                if (!Object.keys(db.value()).includes(sub)) {
                    res.sendStatus(404);
                    return [2 /*return*/];
                }
                _a = req.query, q = _a.q, categorize = _a.categorize;
                _categorize = typeof categorize === "undefined" ? false : categorize === "true";
                if (!q) {
                    res.send(formatSearchResponse(q, sub, db.get(sub).value(), _categorize));
                }
                else {
                    values = db.get(sub).value();
                    results = searchDirectory(req.query.q, values);
                    res.send(formatSearchResponse(q, sub, results, _categorize));
                }
                return [2 /*return*/];
        }
    });
}); });
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, db, txs, rxs;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, database()];
                case 1:
                    db = _c.sent();
                    console.debug("initializing...");
                    if (db.get("treatments").value().length !== 0) {
                        console.debug("initialized (cached)");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getAllListings(config_1.apiHostname + "/tx", config_1.default.relative.ibisRoot("system", "tx"))];
                case 2:
                    txs = _c.sent();
                    return [4 /*yield*/, getAllListings(config_1.apiHostname + "/rx", config_1.default.relative.ibisRoot("system", "rx"))];
                case 3:
                    rxs = _c.sent();
                    console.debug("got all the magic");
                    (_a = db.get("diseases")).splice.apply(_a, [0, 0].concat(txs)).write();
                    (_b = db.get("treatments")).splice.apply(_b, [0, 0].concat(rxs)).write();
                    console.debug("initialized");
                    return [2 /*return*/];
            }
        });
    });
}
exports.initialize = initialize;
exports.default = router;
//# sourceMappingURL=db.js.map