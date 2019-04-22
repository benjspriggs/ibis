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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var node_html_parser_1 = require("node-html-parser");
var ibis_lib_1 = require("ibis-lib");
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = require("lodash");
var path_1 = __importDefault(require("path"));
var nodeMatches = function (condition) { return function (node) { return condition.test(node.rawText); }; };
var childrenContainsDefinitionText = function (condition) { return function (node) { return node.childNodes.some(nodeMatches(condition)); }; };
var emptyNode = function (node) { return node.rawText.trim() === ""; };
function getFileInfo(absoluteFilePath, modality, listing) {
    var _this = this;
    var promises = listing.map(function (filename) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    modality: modality,
                    filename: filename.slice(),
                    header: ibis_lib_1.parseHeaderFromFile(path_1.default.join(absoluteFilePath, modality, filename)),
                })];
        });
    }); });
    return Promise.all(promises);
}
exports.getFileInfo = getFileInfo;
exports.getListing = function (absoluteFilePath, modality) { return new Promise(function (resolve, reject) {
    fs_1.default.readdir(path_1.default.join(absoluteFilePath, modality), function (err, items) {
        if (err) {
            return reject(err);
        }
        resolve(items);
    });
}); };
var addModalityListingToLocals = function (absoluteFilePath) { return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var modality, listing, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                modality = req.params.modality;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, exports.getListing(absoluteFilePath, modality)];
            case 2:
                listing = _a.sent();
                res.locals.listing = listing;
                next();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                next(e_1);
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); }; };
var trimEmptyNodes = function (root) {
    if (root.childNodes.length === 0) {
        if (!emptyNode(root)) {
            return root;
        }
        else {
            return;
        }
    }
    if (root.childNodes.every(function (n) { return emptyNode(n); })) {
        root.childNodes = [];
    }
    else {
        var trimmedNodes = root.childNodes.map(trimEmptyNodes);
        root.childNodes = trimmedNodes.filter(function (n) { return typeof n !== "undefined"; });
    }
    return root;
};
var trimConsecutive = function (childNodes, tag, maxConsecutive) {
    if (tag === void 0) { tag = "BR"; }
    if (maxConsecutive === void 0) { maxConsecutive = 3; }
    if (childNodes.length === 0) {
        return childNodes;
    }
    var i = 0;
    return childNodes.reduce(function (newNodeList, curr) {
        if (curr instanceof node_html_parser_1.HTMLElement) {
            if (curr.tagName === tag) {
                if (i >= maxConsecutive) {
                    return newNodeList;
                }
                else {
                    ++i;
                }
            }
            else {
                i = 0;
            }
        }
        else {
            i = 0;
        }
        newNodeList.push(curr);
        return newNodeList;
    }, []);
};
var trimLeft = function (condition) {
    var contains = nodeMatches(condition);
    var childrenContains = childrenContainsDefinitionText(condition);
    return function (root) {
        if (root instanceof node_html_parser_1.TextNode) {
            if (contains(root) || childrenContains(root)) {
                return root;
            }
        }
        else {
            var body = root;
            if (body.childNodes.length === 0 && contains(body)) {
                console.log("found text: ", body.text);
                return body;
            }
            // prune children
            var answers = body.childNodes.map(function (n) { return contains(n) || childrenContains(n); });
            var first = answers.findIndex(function (v) { return v; });
            if (first) {
                // add the body text
                var newChildren = body.childNodes.slice(first);
                body.childNodes = newChildren;
                return trimEmptyNodes(body);
            }
            console.dir(body.childNodes);
            return body;
        }
    };
};
exports.default = (function (options) {
    var router = express_1.default.Router();
    var afterDefinition = options.trimLeftPattern ? trimLeft(options.trimLeftPattern) : function (root) { return root; };
    router.get("/:modality/:file", function (req, res) {
        var _a = req.params, modality = _a.modality, file = _a.file;
        var filePath = path_1.default.join(options.absoluteFilePath, modality, file);
        var data = fs_1.default.readFileSync(filePath);
        var root = node_html_parser_1.parse(data.toString(), { noFix: false });
        var body = root.childNodes.find(function (node) { return node instanceof node_html_parser_1.HTMLElement; });
        var formattedBoy = afterDefinition(body);
        formattedBoy.childNodes = trimConsecutive(formattedBoy.childNodes);
        var _b = ibis_lib_1.parseHeaderFromFile(filePath), version = _b.version, tag = _b.tag, name = _b.name, category = _b.category;
        res.send({
            modality: modality,
            filename: file,
            filepath: filepath(req, modality, file),
            version: version,
            tag: tag,
            name: name,
            category: category,
            content: formattedBoy.toString()
        });
    });
    function resolved(req, endpoint) {
        return {
            relative: endpoint,
            absolute: req.protocol + "://" + req.headers.host + "/" + endpoint
        };
    }
    var filepath = function (req, modality, filename) { return resolved(req, options.endpoint + "/" + modality + "/" + filename); };
    router.get("/:modality", addModalityListingToLocals(options.absoluteFilePath), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var modality, meta, empty, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modality = req.params.modality;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getFileInfo(options.absoluteFilePath, modality, res.locals.listing)];
                case 2:
                    meta = (_a.sent())
                        .map(function (x) { return (__assign({ filepath: filepath(req, modality, x.filename) }, x)); });
                    empty = meta.filter(function (infoObject) { return lodash_1.isEmpty(infoObject.header) || Object.values(infoObject.header).some(function (val) { return typeof val === "undefined"; }); });
                    res.send({
                        modality: __assign({ code: modality }, ibis_lib_1.getModality(modality)),
                        meta: meta,
                        empty: empty
                    });
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    next(e_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    return router;
});
//# sourceMappingURL=file.js.map