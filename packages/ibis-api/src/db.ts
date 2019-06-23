import { HTMLElement, Node, TextNode, parse } from "node-html-parser"
import { Header, Modality, getModality, modalities } from "ibis-lib"
import { join } from "path"
import { config, apiHostname } from "./config"
import { parseHeader } from "./legacy-import"
import { default as fs } from "fs"
import { default as path } from "path"

import BetterFileAsync from "./BetterFileAsync"
import lowdb from "lowdb"
import isEmpty from "lodash/isEmpty";

export interface Directory {
    id: string,
    url: string,
    modality: Modality,
    header: Header
}

export interface Entry extends Directory {
    content: string
}

export interface Database {
    diseases: Entry[]
    treatments: Entry[]
}

const adapter = new BetterFileAsync<Database>(join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

const nodeMatches = (condition: RegExp) => (node: Node) => condition.test(node.rawText)
const childrenContainsDefinitionText = (condition: RegExp) => (node: Node): boolean => node.childNodes.some(nodeMatches(condition))
const emptyNode = (node: Node) => node.rawText.trim() === ""

const trimEmptyNodes = (root: Node): Node | undefined => {
    if (root.childNodes.length === 0) {
        if (!emptyNode(root)) {
            return root
        } else {
            return
        }
    }

    if (root.childNodes.every(n => emptyNode(n))) {
        root.childNodes = []
    } else {
        const trimmedNodes = root.childNodes.map(trimEmptyNodes)
        root.childNodes = trimmedNodes.filter(n => typeof n !== "undefined")
    }

    return root
}

const trimConsecutive = (childNodes: Node[], tag: string = "BR", maxConsecutive: number = 3): Node[] => {
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

const trimLeft = (condition: RegExp, root: Node): Node => {
    const contains = nodeMatches(condition)
    const childrenContains = childrenContainsDefinitionText(condition)

    if (root instanceof TextNode) {
        console.debug('root is text node')
        if (contains(root) || childrenContains(root)) {
            return root;
        }
    } else {
        // console.debug('root is html node')
        const body = root as HTMLElement;

        if (body.childNodes.length === 0 && contains(body)) {
            // console.log("found text: ", body.text)
            return body;
        }

        // prune children
        const answers: boolean[] = body.childNodes.map(n => contains(n) || childrenContains(n))

        const first = answers.findIndex(v => v)

        console.debug({ first })

        if (first !== -1) {
            // add the body text
            // console.debug("updating children and trimming empty nodes ")
            const newChildren = body.childNodes.slice(first)
            body.childNodes = newChildren
            return trimEmptyNodes(body);
        }

        return body;
    }
}

function getFileInfo(absoluteFilePath: string, modality: string, listing: string[]): Promise<{ id: string, header: Header, content: string }[]> {
    const promises = listing.map(async (filename: string) => {
        const filepather = path.join(absoluteFilePath, modality, filename)

        const content = fs.readFileSync(filepather, { encoding: 'utf-8' })

        const parsed = parse(content.toString(), { noFix: false, lowerCaseTagName: false })

        if (!parsed) {
            throw new Error(`failed to parse content for file at ${filepather}`)
        }

        const body = parsed.childNodes.find(node => node instanceof HTMLElement) as HTMLElement

        if (!body) {
            throw new Error(`unable to find HTML element for file at ${filepather}: ${parsed}`)
        }

        body.childNodes = trimConsecutive(body.childNodes)

        const header = parseHeader(body)

        if (isEmpty(header)) {
            console.warn("empty header for ", filepather)
        }

        let trimmed = trimLeft(/[Dd]efinition/, body) as HTMLElement

        if (!trimmed || trimmed.childNodes.length === 0) {
            console.error("failed trimming left with definition rule on", filepather)
            process.exit(1)
        }

        return {
            modality: modality,
            id: filename.slice(),
            header: header,
            content: trimmed.toString() as string
        }
    })
    return Promise.all(promises)
}

const getListing = (absoluteFilePath: string, modality: string) => new Promise<string[]>((resolve, reject) => {
    fs.readdir(path.join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err)
        }
        resolve(items.filter(item => !item.startsWith(".")))
    })
})

/**
 * Returns all diease-related {@link Directory} that match the query.
 * @param query A predicate for {@link Directory} entries.
 */
export async function getTherapeutics(query?: (d: Directory) => boolean): Promise<Entry[]> {
    const db = await database()

    const therapeutics = db.get("diseases")

    if (!query) {
        return therapeutics.value();
    } else {
        return therapeutics.filter(query).value();
    }
}

/**
 * Returns all technique-related {@link Directory} that match the query.
 * @param query A predicate for {@link Directory} entries.
 */
export async function getMateriaMedica(query?: (d: Directory) => boolean): Promise<Entry[]> {
    const db = await database()

    const treatments = db.get("treatments")

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

async function getAllListings(resourcePrefix: string, abs: string): Promise<Entry[]> {
    return ([] as Entry[]).concat(...await Promise.all(
        Object.keys(modalities).map(async modality => {
            console.debug("getting", abs, modality)

            let listing: string[];

            try {
                listing = await getListing(abs, modality)
            } catch (err) {
                modality = modality.toUpperCase();
                listing = await getListing(abs, modality)
            }

            const fileInfos = await getFileInfo(abs, modality, listing)
            console.debug("done", abs, modality)

            return fileInfos.map(f => ({ ...f, url: `${resourcePrefix}/${modality}/${f.id}`, modality: getModality(modality) }))
        })))
}

export async function initialize() {
    const db = await database()

    console.debug("initializing...")

    if (db.get("treatments").value().length !== 0) {
        console.debug("initialized (cached)")
        return
    }

    console.debug(`fetching all listings from legacy IBIS directory: '${config.relative.ibisRoot(".")}'`)

    if (!fs.existsSync(config.relative.ibisRoot('.'))) {
        console.error("no IBIS directory detected, skipping initialization")
    }

    try {
        await Promise.all([
            getAllListings(`${apiHostname}/tx`, config.relative.ibisRoot("system", "tx"))
                .then(txs => {
                    return db.get("diseases").splice(0, 0, ...txs).write()
                }),
            getAllListings(`${apiHostname}/rx`, config.relative.ibisRoot("system", "rx"))
                .then(rxs => {
                    return db.get("treatments").splice(0, 0, ...rxs).write()
                })
        ])

        console.debug("initialized")
    } catch (e) {
        console.error(`unable to initialize: ${e}`)
    }
}
