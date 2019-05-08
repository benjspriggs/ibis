var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getModality, modalities } from "ibis-lib";
import { join } from "path";
import config, { apiHostname } from "./config";
import { getFileInfo, getListing } from "./file";
import BetterFileAsync from "./BetterFileAsync";
import express from "express";
import fuse from "fuse.js";
import lowdb from "lowdb";
const adapter = new BetterFileAsync(join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
});
function database() {
    return lowdb(adapter);
}
const modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g;
export function query(text) {
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
function searchOptions(options) {
    return (query, data) => {
        if (!data) {
            return [];
        }
        const values = Array.from(data);
        const search = new fuse(values, Object.assign({ shouldSort: true, threshold: 0.25, location: 0, distance: 50, maxPatternLength: 32, minMatchCharLength: 1 }, options));
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
        return [].concat(...yield Promise.all(Object.keys(modalities).map((modality) => __awaiter(this, void 0, void 0, function* () {
            console.debug("getting", abs, modality);
            const listing = yield getListing(abs, modality);
            const fileInfos = yield getFileInfo(abs, modality, listing);
            console.debug("done", abs, modality);
            return fileInfos.map(f => (Object.assign({}, f, { url: `${resourcePrefix}/${modality}/${f.filename}`, modality: getModality(modality) })));
        }))));
    });
}
const router = express.Router();
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
export function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield database();
        console.debug("initializing...");
        if (db.get("treatments").value().length !== 0) {
            console.debug("initialized (cached)");
            return;
        }
        const txs = yield getAllListings(`${apiHostname}/tx`, config.relative.ibisRoot("system", "tx"));
        const rxs = yield getAllListings(`${apiHostname}/rx`, config.relative.ibisRoot("system", "rx"));
        console.debug("got all the magic");
        db.get("diseases").splice(0, 0, ...txs).write();
        db.get("treatments").splice(0, 0, ...rxs).write();
        console.debug("initialized");
        // get ALL the files everywhere
        // put them in the diseases/ tx/ rx
    });
}
export default router;
//# sourceMappingURL=db.js.map