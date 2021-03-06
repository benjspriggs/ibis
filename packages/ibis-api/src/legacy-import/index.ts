import { HTMLElement, Node, parse } from "node-html-parser"
import { config } from "./../config"
import { readdir, readFileSync, existsSync } from "fs";
import { join } from "path";
import { trimConsecutive, trimLeft, parseHeader } from "./utils"

import { modalities, getModality } from "@ibis-app/lib"

import isEmpty from "lodash/isEmpty"
import { Database, Directory, Entry, Category } from "./../db";
import flatten = require("lodash/flatten");

type LegacyCategory = "rx" | "tx"

function getCategoryFromLegacy(cat: LegacyCategory): Category {
    if (cat === "tx") {
        return "treatments"
    } else if (cat === "rx") {
        return "monographs"
    } else {
        throw new Error(`unknown legacy category '${cat}'`)
    }
}

async function getDeserialized(absoluteFilePath: string) {
    const content = readFileSync(absoluteFilePath, { encoding: 'utf-8' })

    const parsed = parse(content.toString(), { noFix: false, lowerCaseTagName: false })

    if (!parsed) {
        throw new Error(`failed to parse content for file at ${absoluteFilePath}`)
    }

    return parsed
}

async function parseAndTrim(options: { parsed: Node }) {
    const body = options.parsed.childNodes.find(node => node instanceof HTMLElement) as HTMLElement

    if (!body) {
        throw new Error(`unable to find HTML element for content`)
    }

    body.childNodes = trimConsecutive(body.childNodes)

    const header = parseHeader(body)

    if (isEmpty(header)) {
        console.warn("empty header")
    }

    let trimmed = trimLeft(/[Dd]efinition/, body) as HTMLElement

    if (!trimmed || trimmed.childNodes.length === 0) {
        console.error("failed trimming left with definition rule")
        process.exit(1)
    }

    return ({
        header,
        content: trimmed.toString()
    })
}

const getListing = (absoluteFilePath: string, modality: string) => new Promise<string[]>((resolve, reject) => {
    readdir(join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err)
        }
        resolve(items.filter(item => !item.startsWith(".")))
    })
})

async function getAllListings(category: LegacyCategory): Promise<Entry[]> {
    const abs = config.relative.ibisRoot("system", category)

    const modalityCodes = Object.keys(modalities)

    return flatten(await Promise.all(
        modalityCodes.map(async modality => {
            console.debug("getting", abs, modality)

            let listing: string[];

            try {
                listing = await getListing(abs, modality)
            } catch (err) {
                modality = modality.toUpperCase();
                listing = await getListing(abs, modality)
            }

            const withParsedContent = await Promise.all(
                listing.map(async (filename) => ({
                    filename, 
                    parsed: await getDeserialized(join(abs, modality, filename)),
                })))

            console.log("finished parsing content for entries in modality", category, modality)

            return await Promise.all(withParsedContent.map((async content => ({
                ...await parseAndTrim(content),
                id: content.filename,
                category: getCategoryFromLegacy(category),
                modality: getModality(modality)
            }))))
        })))
}

export async function importEntriesFromDisk(): Promise<Database> {
    console.debug(`fetching all listings from legacy IBIS directory: '${config.relative.ibisRoot(".")}'`)

    if (!existsSync(config.relative.ibisRoot('.'))) {
        console.error("no IBIS directory detected, skipping initialization")
    }

    function stripContent(entry: Entry): Directory {
        const { content, ...directory } = entry

        return directory;
    }

    const diseases = getAllListings("tx")
    const monographs = getAllListings("rx")

    return {
        "monographs": (await monographs).map(stripContent),
        "treatments": (await diseases).map(stripContent),
        "content": {
            "monographs": await monographs,
            "treatments": await diseases
        }
    }
}
