"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
Object.defineProperty(exports, "__esModule", { value: true });
const ibis_lib_1 = require("ibis-lib");
const path_1 = require("path");
const config_1 = __importStar(require("./config"));
const file_1 = require("./file");
const BetterFileAsync_1 = __importDefault(require("./BetterFileAsync"));
const express_1 = __importDefault(require("express"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const lowdb_1 = __importDefault(require("lowdb"));
const adapter = new BetterFileAsync_1.default(path_1.join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
});
function database() {
    return lowdb_1.default(adapter);
}
const modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g;
function query(text) {
    const result = {
        text: text
    };
    const matches = text.match(modalityPattern);
    if (matches !== null) {
        if (matches.length > 1) {
            throw new Error("multiple modality codes not allowed");
        }
        const matchedModality = modalityPattern.exec(text)[1];
        result.modality = matchedModality.replace(/[""]/g, "");
    }
    return result;
}
exports.query = query;
function searchOptions(options) {
    return (query, data) => {
        if (!data) {
            return [];
        }
        const values = Array.from(data);
        const search = new fuse_js_1.default(values, Object.assign({ shouldSort: true, threshold: 0.25, location: 0, distance: 50, maxPatternLength: 32, minMatchCharLength: 1 }, options));
        const results = search.search(query);
        if ("matches" in results) {
            return results;
        }
        else {
            return results;
        }
    };
}
const searchDirectory = searchOptions({
    keys: ["header", "header.name"]
});
function getAllListings(resourcePrefix, abs) {
    return __awaiter(this, void 0, void 0, function* () {
        return [].concat(...yield Promise.all(Object.keys(ibis_lib_1.modalities).map((modality) => __awaiter(this, void 0, void 0, function* () {
            console.debug("getting", abs, modality);
            const listing = yield file_1.getListing(abs, modality);
            const fileInfos = yield file_1.getFileInfo(abs, modality, listing);
            console.debug("done", abs, modality);
            return fileInfos.map(f => (Object.assign({}, f, { url: `${resourcePrefix}/${modality}/${f.filename}`, modality: ibis_lib_1.getModality(modality) })));
        }))));
    });
}
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const db = yield database();
    if (!req.query.q) {
        res.send(db.value());
        return;
    }
    const t = db.get("treatments");
    const d = db.get("diseases");
    res.send(searchDirectory(req.query.q, [].concat(...t.value(), ...d.value())));
}));
function formatSearchResponse(query, directory, results, categorize = false) {
    if (categorize) {
        return ({
            query: query,
            directory: directory,
            results: results.reduce((acc, cur) => {
                const name = cur.modality.data.displayName;
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
router.get("/:sub", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { sub } = req.params;
    const db = yield database();
    if (!Object.keys(db.value()).includes(sub)) {
        res.sendStatus(404);
        return;
    }
    const { q, categorize } = req.query;
    const _categorize = typeof categorize === "undefined" ? false : categorize === "true";
    if (!q) {
        res.send(formatSearchResponse(q, sub, db.get(sub).value(), _categorize));
    }
    else {
        const values = db.get(sub).value();
        const results = searchDirectory(req.query.q, values);
        res.send(formatSearchResponse(q, sub, results, _categorize));
    }
}));
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database();
        console.debug("initializing...");
        if (db.get("treatments").value().length !== 0) {
            console.debug("initialized (cached)");
            return;
        }
        const txs = yield getAllListings(`${config_1.apiHostname}/tx`, config_1.default.relative.ibisRoot("system", "tx"));
        const rxs = yield getAllListings(`${config_1.apiHostname}/rx`, config_1.default.relative.ibisRoot("system", "rx"));
        console.debug("got all the magic");
        db.get("diseases").splice(0, 0, ...txs).write();
        db.get("treatments").splice(0, 0, ...rxs).write();
        console.debug("initialized");
        // get ALL the files everywhere
        // put them in the diseases/ tx/ rx
    });
}
exports.initialize = initialize;
exports.default = router;
