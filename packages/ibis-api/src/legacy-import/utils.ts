import { HTMLElement, Node, TextNode, parse } from "node-html-parser"
import { Header } from "@ibis-app/lib"

import flatten from "lodash/flatten"

export const flattenNode = (node: Node) => {
    if (node instanceof TextNode) {
        return [node.rawText.trim()]
    } else if (node instanceof HTMLElement) {
        if (node.childNodes[0] instanceof TextNode) {
            return node.childNodes.slice(0, 10).map(n => n.rawText.trim())
        }
    }
    return []
}

export const possibleNodes = (node: Node) => {
    if (!node) {
        return []
    }

    return flatten(node.childNodes
        .map(flattenNode)
        .filter(nodeText => nodeText.every(text => text !== "")))
}

const nodeMatches = (condition: RegExp, node: Node) => condition.test(node.rawText)
const childrenContainsDefinitionText = (condition: RegExp, node: Node): boolean => node.childNodes.some(node => nodeMatches(condition, node))
const emptyNode = (node: Node) => node.rawText.trim() === ""

export function trimEmptyNodes(root: Node): Node | undefined {
    if (root.childNodes.length === 0) {
        return emptyNode(root) ? undefined : root
    }

    root.childNodes = root.childNodes
                            .map(trimEmptyNodes)
                            .filter(n => typeof n !== "undefined")

    return root
}

export function trimConsecutive(childNodes: Node[], tag: string = "BR", maxConsecutive: number = 3): Node[] {
    if (childNodes.length === 0) {
        return childNodes
    }

    let i = 0;

    return childNodes.reduce((newNodeList, curr) => {
        if (curr instanceof HTMLElement) {
            if (curr.tagName === tag) {
                if (i >= maxConsecutive) {
                    return newNodeList
                } else {
                    ++i
                }
            } else {
                i = 0
            }
        } else {
            i = 0
        }

        newNodeList.push(curr)

        return newNodeList
    }, []);
}

/**
 * Trims all nodes up to the first truthy value, based on {@link answers}.
 * If {@link answers} is an empty array, or if there are no truthy values,
 * this will return an unmodified {@link body}.
 */
function pruneChildren(answers: boolean[], body: Node) {
    if (answers.length !== body.childNodes.length) {
        throw new Error("answers did not match length of childNode array")
    }

    const indexOfFirstChildContainingPattern = answers.findIndex(v => v)

    // console.debug({ first })

    if (indexOfFirstChildContainingPattern === -1) {
        return body
    }

    // add the body text
    // console.debug("updating children and trimming empty nodes ")
    const newChildren = body.childNodes.slice(indexOfFirstChildContainingPattern)
    body.childNodes = newChildren
    return trimEmptyNodes(body);
}

export const trimLeft = (condition: RegExp, root: Node): Node => {
    const nodeOrChildrenContains = (n: Node) => nodeMatches(condition, n) || childrenContainsDefinitionText(condition, n)

    if (root instanceof TextNode) {
        return nodeOrChildrenContains(root) ? root : undefined;
    }

    // console.debug('root is html node')
    const body = root as HTMLElement;

    if (body.childNodes.length === 0) {
        // console.log("found text: ", body.text)
        return body;
    }

    // prune children
    const answers: boolean[] = body.childNodes.map(nodeOrChildrenContains)

    return pruneChildren(answers, body)
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
