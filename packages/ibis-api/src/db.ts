import { Header, Modality } from "ibis-lib"
import { join } from "path"
import { importEntriesFromDisk } from "./legacy-import"

import BetterFileAsync from "./BetterFileAsync"
import lowdb from "lowdb"

export interface Directory {
    id: string,
    modality: Modality,
    header: Header
}

export interface Entry extends Directory {
    content: string
}

export interface Database {
    diseases: Directory[]
    treatments: Directory[],
    content: {
        diseases: Entry[],
        treatments: Entry[]
    }
}

const adapter = new BetterFileAsync<Database>(join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
        content: {
            diseases: [],
            treatments: []
        }
    },
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

/**
 * Returns all diease-related {@link Directory} that match the query.
 * @param query A predicate for {@link Directory} entries.
 */
export async function getTherapeutics(query?: (d: Directory) => boolean): Promise<Directory[]> {
    const db = await database()

    const therapeutics = db.get("diseases")

    if (!query) {
        return therapeutics.value();
    } else {
        return therapeutics.filter(query).value();
    }
}

export async function getTherapeuticContent(query?: (e: Entry) => boolean): Promise<Entry[]> {
    const db = await database()

    const therapeutics = db.get("content").get("diseases")

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
export async function getMateriaMedica(query?: (d: Directory) => boolean): Promise<Directory[]> {
    const db = await database()

    const treatments = db.get("treatments")

    if (!query) {
        return treatments.value();
    } else {
        return treatments.filter(query).value();
    }
}

export async function getMateriaMedicaContent(query?: (e: Entry) => boolean): Promise<Entry[]> {
    const db = await database()

    const treatments = db.get("content").get("treatments")

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
