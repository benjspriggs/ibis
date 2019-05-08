import { HTMLElement, TextNode, parse } from "node-html-parser";
import { flatten } from "lodash";
import { join, dirname } from "path";
import { readFileSync } from "fs";
export const modalities = {
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
export function getModality(codeOrDisplayName) {
    const lower = codeOrDisplayName.toLowerCase();
    if (lower in modalities) {
        return ({ code: lower, data: modalities[lower] });
    }
    else {
        const [code, modality] = Object.entries(modalities).find(([_, modality]) => modality.displayName.toLowerCase() === codeOrDisplayName);
        return ({ code: code, data: modality });
    }
}
const flattenNode = (node) => {
    if (node instanceof TextNode) {
        return [node.rawText.trim()];
    }
    else if (node instanceof HTMLElement) {
        if (node.childNodes[0] instanceof TextNode) {
            return node.childNodes.slice(0, 10).map(n => n.rawText.trim());
        }
    }
    return [];
};
const possibleNodes = (node) => {
    if (!node) {
        return [];
    }
    return flatten(node.childNodes
        .map(flattenNode)
        .filter(nodeText => nodeText.every(text => text !== "")));
};
export function parseHeaderFromFile(filepath) {
    if (typeof filepath === "undefined") {
        throw new Error("undefined filepath");
    }
    const buffer = readFileSync(filepath);
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
const versionPattern = /^-IBIS-(\d+)\.(\d+)\.(\d+)-$/;
// TODO: this doesn"t reliably parse the headers for most files
// @bspriggs investigate
export function parseHeader(source) {
    const root = parse(source, { noFix: false, lowerCaseTagName: false });
    const htmlRoot = root.childNodes
        .find(node => node instanceof HTMLElement);
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
export const requestLogger = (req, _, next) => {
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
        return dirname(pkg.entrypoint);
    }
    else {
        return join(__dirname, "../..");
    }
}
/**
 * See https://www.npmjs.com/package/pkg#snapshot-filesystem
 */
export function isPackaged() {
    const pkg = process.pkg;
    return !!pkg;
}
export const applicationRoot = detectApplicationRoot();
//# sourceMappingURL=index.js.map