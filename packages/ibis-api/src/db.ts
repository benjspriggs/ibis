import { Header, Modality, getModality, modalities } from "ibis-lib"
import { join } from "path"
import { config, apiHostname } from "./config"
import { getFileInfo, getListing } from "./file";

import BetterFileAsync from "./BetterFileAsync"
import { default as express, Router } from "express"
import fuse from "fuse.js"
import lowdb from "lowdb"

export interface Directory {
    url: string,
    modality: Modality,
    header: Header
}

export interface Database {
    diseases: Directory[]
    treatments: Directory[]
}

const adapter = new BetterFileAsync<Database>(join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
})

export function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

async function getAllListings(resourcePrefix: string, abs: string): Promise<Directory[]> {
    return ([] as Directory[]).concat(...await Promise.all(
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

            return fileInfos.map(f => ({ ...f, url: `${resourcePrefix}/${modality}/${f.filename}`, modality: getModality(modality) }))
        })))
}

export async function initialize() {
    const db = await database()

    console.debug("initializing...")

    if (db.get("treatments").value().length !== 0) {
        console.debug("initialized (cached)")
        return
    }

    try {
        const txs = await getAllListings(`${apiHostname}/tx`, config.relative.ibisRoot("system", "tx"))
        const rxs = await getAllListings(`${apiHostname}/rx`, config.relative.ibisRoot("system", "rx"))
        console.debug(`fetched all listings from legacy IBIS directory: '${config.relative.ibisRoot(".")}'`)

        console.debug("writing all legacy listings to db")
        db.get("diseases").splice(0, 0, ...txs).write()
        db.get("treatments").splice(0, 0, ...rxs).write()
        console.debug("initialized")
    } catch (e) {
        console.error(`unable to initialize: ${e}`)
    }
}
