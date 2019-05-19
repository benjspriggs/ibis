"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const ibis_lib_1 = require("ibis-lib");
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const nodeMatches = (condition) => (node) => condition.test(node.rawText);
const childrenContainsDefinitionText = (condition) => (node) => node.childNodes.some(nodeMatches(condition));
const emptyNode = (node) => node.rawText.trim() === "";
function getFileInfo(absoluteFilePath, modality, listing) {
    const promises = listing.map(async (filename) => ({
        modality: modality,
        filename: filename.slice(),
        header: ibis_lib_1.parseHeaderFromFile(path_1.default.join(absoluteFilePath, modality, filename)),
    }));
    return Promise.all(promises);
}
exports.getFileInfo = getFileInfo;
exports.getListing = (absoluteFilePath, modality) => new Promise((resolve, reject) => {
    fs_1.default.readdir(path_1.default.join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err);
        }
        resolve(items);
    });
});
const addModalityListingToLocals = (absoluteFilePath) => async (req, res, next) => {
    const { modality } = req.params;
    try {
        const listing = await exports.getListing(absoluteFilePath, modality);
        res.locals.listing = listing;
        next();
    }
    catch (e) {
        next(e);
        return;
    }
};
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
const trimLeft = (condition) => {
    const contains = nodeMatches(condition);
    const childrenContains = childrenContainsDefinitionText(condition);
    return (root) => {
        if (root instanceof node_html_parser_1.TextNode) {
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
exports.default = (options) => {
    let router = express_1.default.Router();
    const afterDefinition = options.trimLeftPattern ? trimLeft(options.trimLeftPattern) : (root) => root;
    router.get("/:modality/:file", (req, res) => {
        const { modality, file } = req.params;
        const filePath = path_1.default.join(options.absoluteFilePath, modality, file);
        const data = fs_1.default.readFileSync(filePath);
        const root = node_html_parser_1.parse(data.toString(), { noFix: false });
        const body = root.childNodes.find(node => node instanceof node_html_parser_1.HTMLElement);
        const formattedBoy = afterDefinition(body);
        formattedBoy.childNodes = trimConsecutive(formattedBoy.childNodes);
        const { version, tag, name, category } = ibis_lib_1.parseHeaderFromFile(filePath);
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
    router.get("/:modality", addModalityListingToLocals(options.absoluteFilePath), async (req, res, next) => {
        const { modality } = req.params;
        try {
            const meta = (await getFileInfo(options.absoluteFilePath, modality, res.locals.listing))
                .map(x => (Object.assign({ filepath: filepath(req, modality, x.filename) }, x)));
            const empty = meta.filter((infoObject) => lodash_1.isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === "undefined"));
            res.send({
                modality: Object.assign({ code: modality }, ibis_lib_1.getModality(modality)),
                meta: meta,
                empty: empty
            });
        }
        catch (e) {
            next(e);
        }
    });
    return router;
};
