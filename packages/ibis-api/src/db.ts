import { Header, Modality } from "ibis-lib"
import { join } from "path"
import { importEntriesFromDisk } from "./legacy-import"

import BetterFileAsync from "./BetterFileAsync"
import lowdb from "lowdb"

export type Category = "monographs" | "treatments"

export function getCategoryFromRequestString(category: string): Category {
    switch (category) {
        case "treatments":
        case "diseases":
        case "therapeutics":
            return "treatments";
        case "monographs":
            return "monographs"
        default:
            throw new Error(`unknown category '${category}'`)
    }
}

export interface Directory {
    id: string,
    category: Category,
    modality: Modality,
    header: Header
}

export interface Entry extends Directory {
    content: string
}

export interface Database {
    /**
     * The description of a specific herb or strategy.
     */
    monographs: Directory[]
    /**
     * The treatments for specific diseases, using components from a modality.
     */
    treatments: Directory[],
    content: {
        monographs: Entry[],
        treatments: Entry[]
    }
}

export function getDirectoryIdentifier(directory: { category: Category, modality: Modality, id: string }): string {
    return `/${directory.category}/${directory.modality.code}/${directory.id}`
}

const adapter = new BetterFileAsync<Database>(join(process.cwd(), "db.json"), {
    defaultValue: {
        monographs: [],
        treatments: [],
        content: {
            monographs: [],
            treatments: []
        }
    },
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

export async function getMetaContent(category: Category, query?: (d: Directory) => boolean): Promise<Directory[]> {
    const db = await database()

    const treatments = db.get(category)

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

export async function getContent(category: Category, query?: (e: Entry) => boolean): Promise<Entry[]> {
    const db = await database()

    const treatments = db.get("content").get(category)

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

export async function initialize() {
    const db = await database()

    console.debug("initializing...")

    if (db.get("treatments").value().length !== 0) {
        console.debug("initialized (cached)")
        return
    }

    try {
        console.debug(`fetching all listings from legacy IBIS directory`)

        const imported = await importEntriesFromDisk()

        await db.setState(imported).write()

        console.debug("initialized")
    } catch (e) {
        console.error(`unable to initialize: ${e}`)
    }
}
