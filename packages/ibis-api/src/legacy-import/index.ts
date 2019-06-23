import { HTMLElement, Node, parse } from "node-html-parser"
import { config } from "./../config"
import { readdir, readFileSync, existsSync } from "fs";
import { join } from "path";
import { trimConsecutive, trimLeft, parseHeader } from "./utils"

import { Header, modalities, getModality } from "ibis-lib"

import isEmpty from "lodash/isEmpty"
import { Database, Directory, Entry, Category } from "./../db";

async function getFileInfo({
    absoluteFilePath,
    modality,
    listing
}: {
    absoluteFilePath: string,
    modality: string,
    listing: string[]
}): Promise<{ id: string, header: Header, content: string }[]> {
    async function getParsedContent(filename: string) {
        const filepather = join(absoluteFilePath, modality, filename)

        const content = readFileSync(filepather, { encoding: 'utf-8' })

        const parsed = parse(content.toString(), { noFix: false, lowerCaseTagName: false })

        if (!parsed) {
            throw new Error(`failed to parse content for file at ${filepather}`)
        }

        return {
            filename,
            filepather,
            parsed
        }
    }

    async function getModifiedEntryBody({ filename, parsed, filepather }: { filename: string, parsed: Node, filepather: string }) {
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

        return ({
            header,
            filename,
            filepather,
            trimmed
        })
    }

    const modifiedBodies = await Promise.all(listing.map(getParsedContent).map(p => p.then(getModifiedEntryBody)))

    return modifiedBodies.map(({ filename, trimmed, header }) => ({
        modality: modality,
        id: filename.slice(),
        header: header,
        content: trimmed.toString() as string
    }))
}

const getListing = (absoluteFilePath: string, modality: string) => new Promise<string[]>((resolve, reject) => {
    readdir(join(absoluteFilePath, modality), (err, items) => {
        if (err) {
            return reject(err)
        }
        resolve(items.filter(item => !item.startsWith(".")))
    })
})

async function getAllListings(category: Category, abs: string): Promise<Entry[]> {
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

            const fileInfos = await getFileInfo({ absoluteFilePath: abs, modality, listing })
            console.debug("done", abs, modality)

            return fileInfos.map(f => ({ ...f, modality: getModality(modality), category: category }))
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

    const diseases = getAllListings("treatments", config.relative.ibisRoot("system", "tx"))
    const monographs = getAllListings("monographs", config.relative.ibisRoot("system", "rx"))

    return {
        "monographs": (await monographs).map(stripContent),
        "treatments": (await diseases).map(stripContent),
        "content": {
            "monographs": await monographs,
            "treatments": await diseases
        }
    }
}
