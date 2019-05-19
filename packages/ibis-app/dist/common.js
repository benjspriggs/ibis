"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const ibis_lib_1 = require("ibis-lib");
exports.modalities = ibis_lib_1.modalities;
const lodash_1 = require("lodash");
const fs_1 = require("fs");
function getModality(codeOrDisplayName) {
    const lower = codeOrDisplayName.toLowerCase();
    if (lower in ibis_lib_1.modalities) {
        return ({ code: lower, data: ibis_lib_1.modalities[lower] });
    }
    else {
        const [code, modality] = Object.entries(ibis_lib_1.modalities).find(([_, modality]) => modality.displayName.toLowerCase() === codeOrDisplayName);
        return ({ code: code, data: modality });
    }
}
exports.getModality = getModality;
const flattenNode = (node) => {
    if (node instanceof node_html_parser_1.TextNode) {
        return [node.rawText.trim()];
    }
    else if (node instanceof node_html_parser_1.HTMLElement) {
        if (node.childNodes[0] instanceof node_html_parser_1.TextNode) {
            return node.childNodes.slice(0, 10).map(n => n.rawText.trim());
        }
    }
    return [];
};
const possibleNodes = (node) => {
    if (!node) {
        return [];
    }
    return lodash_1.flatten(node.childNodes
        .map(flattenNode)
        .filter(nodeText => nodeText.every(text => text !== "")));
};
function parseHeaderFromFile(filepath) {
    if (typeof filepath === "undefined") {
        throw new Error("undefined filepath");
    }
    const buffer = fs_1.readFileSync(filepath);
    const data = buffer.toString();
    const interestingNode = parseHeader(data);
    const [version, _, tag, name, category] = interestingNode;
    return ({
        version: version,
        tag: tag,
        name: name,
        category: category
    });
}
exports.parseHeaderFromFile = parseHeaderFromFile;
const versionPattern = /^-IBIS-(\d+)\.(\d+)\.(\d+)-$/;
// TODO: this doesn't reliably parse the headers for most files
// @bspriggs investigate
function parseHeader(source) {
    const root = node_html_parser_1.parse(source, { noFix: false, lowerCaseTagName: false });
    const htmlRoot = root.childNodes
        .find(node => node instanceof node_html_parser_1.HTMLElement);
    if (!htmlRoot) {
        return [];
    }
    const head = htmlRoot.querySelector("HEAD");
    const body = htmlRoot.querySelector("BODY");
    const interestingNodes = [].concat(possibleNodes(htmlRoot), possibleNodes(head), possibleNodes(body));
    const first = interestingNodes.findIndex(node => versionPattern.test(node));
    // console.log(first)
    // console.dir(interestingNodes)
    return interestingNodes.slice(first, first + 5).map(s => s.slice());
}
exports.parseHeader = parseHeader;
exports.requestLogger = (req, _, next) => {
    console.log(JSON.stringify({
        date: new Date(),
        path: req.path,
        query: req.query,
        "user-agent": req.headers["user-agent"],
    }));
    next();
};

//# sourceMappingURL=common.js.map
