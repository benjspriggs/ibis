"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_html_parser_1 = require("node-html-parser");
const lodash_1 = require("lodash");
const path_1 = require("path");
const fs_1 = require("fs");
exports.modalities = {
    "acup": {
        displayName: "Acupuncture"
    },
    "bota": {
        displayName: "Botanical Medicine"
    },
    "chin": {
        displayName: "Chinese Medicine"
    },
    "diag": {
        displayName: "Diagnostic"
    },
    "home": {
        displayName: "Homeopathy"
    },
    "inte": {
        displayName: "WHO TF KNOWS"
    },
    "nutr": {
        displayName: "Nutrition"
    },
    "phys": {
        displayName: "Physical Medicine"
    },
    "psyc": {
        displayName: "Psychology (?)"
    },
    "vibr": {
        displayName: "Vibrators? Who tf knows"
    },
};
function getModality(codeOrDisplayName) {
    const lower = codeOrDisplayName.toLowerCase();
    if (lower in exports.modalities) {
        return ({ code: lower, data: exports.modalities[lower] });
    }
    else {
        const [code, modality] = Object.entries(exports.modalities).find(([_, modality]) => modality.displayName.toLowerCase() === codeOrDisplayName);
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
// TODO: this doesn"t reliably parse the headers for most files
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
function detectApplicationRoot() {
    if (isPackaged()) {
        // https://www.npmjs.com/package/pkg#snapshot-filesystem
        const pkg = process.pkg;
        return path_1.dirname(pkg.entrypoint);
    }
    else {
        return path_1.join(__dirname, "../..");
    }
}
/**
 * See https://www.npmjs.com/package/pkg#snapshot-filesystem
 */
function isPackaged() {
    const pkg = process.pkg;
    return !!pkg;
}
exports.isPackaged = isPackaged;
exports.applicationRoot = detectApplicationRoot();
