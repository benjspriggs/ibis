import { HTMLElement, Node, TextNode } from "node-html-parser"

import { Header } from "ibis-lib"

import flatten from "lodash/flatten"

const flattenNode = (node: Node) => {
    if (node instanceof TextNode) {
        return [node.rawText.trim()]
    } else if (node instanceof HTMLElement) {
        if (node.childNodes[0] instanceof TextNode) {
            return node.childNodes.slice(0, 10).map(n => n.rawText.trim())
        }
    }
    return []
}

const possibleNodes = (node: Node) => {
    if (!node) {
        return []
    }

    return flatten(node.childNodes
        .map(flattenNode)
        .filter(nodeText => nodeText.every(text => text !== "")))
}

const versionPattern = /^-IBIS-(\d+)\.(\d+)\.(\d+)-$/

// TODO: this doesn"t reliably parse the headers for most files
// @bspriggs investigate
export function parseHeader(htmlRoot: HTMLElement): Header {
    const head = htmlRoot.querySelector("HEAD")
    const body = htmlRoot.querySelector("BODY")

    const interestingNodes: string[] = [].concat(
        possibleNodes(htmlRoot),
        possibleNodes(head),
        possibleNodes(body))

    const first = interestingNodes.findIndex(node => versionPattern.test(node))

    const [
        version,
        _,
        tag,
        name,
        category
    ] = interestingNodes.slice(first, first + 5).map(s => s.slice())

    return ({
        version: version,
        tag: tag,
        name: name,
        category: category
    })
}
