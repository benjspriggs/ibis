var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HTMLElement, TextNode, parse } from "node-html-parser";
import { getModality, parseHeaderFromFile } from "ibis-lib";
import express from "express";
import fs from "fs";
import { isEmpty } from "lodash";
import path from "path";
const nodeMatches = (condition) => (node) => condition.test(node.rawText);
const childrenContainsDefinitionText = (condition) => (node) => node.childNodes.some(nodeMatches(condition));
const emptyNode = (node) => node.rawText.trim() === "";
export function getFileInfo(absoluteFilePath, modality, listing) {
    const promises = listing.map((filename) => __awaiter(this, void 0, void 0, function* () {
        return ({
            modality: modality,
            filename: filename.slice(),
            header: parseHeaderFromFile(path.join(absoluteFilePath, modality, filename)),
        });
    }));
    return Promise.all(promises);
}
export const getListing = (absoluteFilePath, modality) => new Promise((resolve, reject) => {
    fs.readdir(path.join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err);
        }
        resolve(items);
    });
});
const addModalityListingToLocals = (absoluteFilePath) => (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const { modality } = req.params;
    try {
        const listing = yield getListing(absoluteFilePath, modality);
        res.locals.listing = listing;
        next();
    }
    catch (e) {
        next(e);
        return;
    }
});
const trimEmptyNodes = (root) => {
    if (root.childNodes.length === 0) {
        if (!emptyNode(root)) {
            return root;
        }
        else {
            return;
        }
    }
    if (root.childNodes.every(n => emptyNode(n))) {
        root.childNodes = [];
    }
    else {
        const trimmedNodes = root.childNodes.map(trimEmptyNodes);
        root.childNodes = trimmedNodes.filter(n => typeof n !== "undefined");
    }
    return root;
};
const trimConsecutive = (childNodes, tag = "BR", maxConsecutive = 3) => {
    if (childNodes.length === 0) {
        return childNodes;
    }
    let i = 0;
    return childNodes.reduce((newNodeList, curr) => {
        if (curr instanceof HTMLElement) {
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
const trimLeft = (condition) => {
    const contains = nodeMatches(condition);
    const childrenContains = childrenContainsDefinitionText(condition);
    return (root) => {
        if (root instanceof TextNode) {
            if (contains(root) || childrenContains(root)) {
                return root;
            }
        }
        else {
            const body = root;
            if (body.childNodes.length === 0 && contains(body)) {
                console.log("found text: ", body.text);
                return body;
            }
            // prune children
            const answers = body.childNodes.map(n => contains(n) || childrenContains(n));
            const first = answers.findIndex(v => v);
            if (first) {
                // add the body text
                const newChildren = body.childNodes.slice(first);
                body.childNodes = newChildren;
                return trimEmptyNodes(body);
            }
            console.dir(body.childNodes);
            return body;
        }
    };
};
export default (options) => {
    let router = express.Router();
    const afterDefinition = options.trimLeftPattern ? trimLeft(options.trimLeftPattern) : (root) => root;
    router.get("/:modality/:file", (req, res) => {
        const { modality, file } = req.params;
        const filePath = path.join(options.absoluteFilePath, modality, file);
        const data = fs.readFileSync(filePath);
        const root = parse(data.toString(), { noFix: false });
        const body = root.childNodes.find(node => node instanceof HTMLElement);
        const formattedBoy = afterDefinition(body);
        formattedBoy.childNodes = trimConsecutive(formattedBoy.childNodes);
        const { version, tag, name, category } = parseHeaderFromFile(filePath);
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
            absolute: `${req.protocol}://${req.headers.host}/${endpoint}`
        };
    }
    const filepath = (req, modality, filename) => resolved(req, `${options.endpoint}/${modality}/${filename}`);
    router.get("/:modality", addModalityListingToLocals(options.absoluteFilePath), (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const { modality } = req.params;
        try {
            const meta = (yield getFileInfo(options.absoluteFilePath, modality, res.locals.listing))
                .map(x => (Object.assign({ filepath: filepath(req, modality, x.filename) }, x)));
            const empty = meta.filter((infoObject) => isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === "undefined"));
            res.send({
                modality: Object.assign({ code: modality }, getModality(modality)),
                meta: meta,
                empty: empty
            });
        }
        catch (e) {
            next(e);
        }
    }));
    return router;
};
//# sourceMappingURL=file.js.map