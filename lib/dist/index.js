"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_html_parser_1 = require("node-html-parser");
var lodash_1 = require("lodash");
var path_1 = require("path");
var fs_1 = require("fs");
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
    var lower = codeOrDisplayName.toLowerCase();
    if (lower in exports.modalities) {
        return ({ code: lower, data: exports.modalities[lower] });
    }
    else {
        var _a = Object.entries(exports.modalities).find(function (_a) {
            var _ = _a[0], modality = _a[1];
            return modality.displayName.toLowerCase() === codeOrDisplayName;
        }), code = _a[0], modality = _a[1];
        return ({ code: code, data: modality });
    }
}
exports.getModality = getModality;
var flattenNode = function (node) {
    if (node instanceof node_html_parser_1.TextNode) {
        return [node.rawText.trim()];
    }
    else if (node instanceof node_html_parser_1.HTMLElement) {
        if (node.childNodes[0] instanceof node_html_parser_1.TextNode) {
            return node.childNodes.slice(0, 10).map(function (n) { return n.rawText.trim(); });
        }
    }
    return [];
};
var possibleNodes = function (node) {
    if (!node) {
        return [];
    }
    return lodash_1.flatten(node.childNodes
        .map(flattenNode)
        .filter(function (nodeText) { return nodeText.every(function (text) { return text !== ""; }); }));
};
function parseHeaderFromFile(filepath) {
    if (typeof filepath === "undefined") {
        throw new Error("undefined filepath");
    }
    var buffer = fs_1.readFileSync(filepath);
    var data = buffer.toString();
    var interestingNode = parseHeader(data);
    var version = interestingNode[0], _ = interestingNode[1], tag = interestingNode[2], name = interestingNode[3], category = interestingNode[4];
    return ({
        version: version,
        tag: tag,
        name: name,
        category: category
    });
}
exports.parseHeaderFromFile = parseHeaderFromFile;
var versionPattern = /^-IBIS-(\d+)\.(\d+)\.(\d+)-$/;
// TODO: this doesn"t reliably parse the headers for most files
// @bspriggs investigate
function parseHeader(source) {
    var root = node_html_parser_1.parse(source, { noFix: false, lowerCaseTagName: false });
    var htmlRoot = root.childNodes
        .find(function (node) { return node instanceof node_html_parser_1.HTMLElement; });
    if (!htmlRoot) {
        return [];
    }
    var head = htmlRoot.querySelector("HEAD");
    var body = htmlRoot.querySelector("BODY");
    var interestingNodes = [].concat(possibleNodes(htmlRoot), possibleNodes(head), possibleNodes(body));
    var first = interestingNodes.findIndex(function (node) { return versionPattern.test(node); });
    // console.log(first)
    // console.dir(interestingNodes)
    return interestingNodes.slice(first, first + 5).map(function (s) { return s.slice(); });
}
exports.parseHeader = parseHeader;
exports.requestLogger = function (req, _, next) {
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
        var pkg = process.pkg;
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
    var pkg = process.pkg;
    return !!pkg;
}
exports.isPackaged = isPackaged;
exports.applicationRoot = detectApplicationRoot();
//# sourceMappingURL=index.js.map