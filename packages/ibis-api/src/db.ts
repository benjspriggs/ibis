import { Header, Modality } from "ibis-lib"
import { join } from "path"
import { importEntriesFromDisk } from "./legacy-import"

import BetterFileAsync from "./BetterFileAsync"
import lowdb from "lowdb"

export type Category = "monographs" | "treatments"

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

export async function getTreatmentMetaContent(query?: (d: Directory) => boolean): Promise<Directory[]> {
    const db = await database()

    const treatments = db.get("treatments")

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

export async function getTreatmentContent(query?: (e: Entry) => boolean): Promise<Entry[]> {
    const db = await database()

    const treatments = db.get("content").get("treatments")

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

export async function getMonographMetaContent(query?: (d: Directory) => boolean): Promise<Directory[]> {
    const db = await database()

    const monographs = db.get("monographs")

    if (!query) {
        return monographs.value();
    } else {
        return monographs.filter(query).value();
    }
}

export async function getMonographContent(query?: (e: Entry) => boolean): Promise<Entry[]> {
    const db = await database()

    const monographs = db.get("content").get("monographs")

    if (!query) {
        return monographs.value();
    } else {
        return monographs.filter(query).value();
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
