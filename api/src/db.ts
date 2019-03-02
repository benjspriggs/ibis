import { Header, Modality, getModality, modalities } from "ibis-lib"
import config, { apiHostname } from "./config"
import { getFileInfo, getListing } from "./file";

import BetterFileAsync from "./BetterFileAsync"
import express from "express"
import fuse from "fuse.js"
import lowdb from "lowdb"

const adapter = new BetterFileAsync<Database>("db.json", {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

export interface Directory {
    url: string,
    modality: Modality,
    header: Header
}

export interface Database {
    diseases: Directory[]
    treatments: Directory[]
}

export interface Query {
    text: string,
    modality?: string
}

const modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g

export function query(text: string): Query {
    const result: Query = {
        text: text
    }

    const matches = text.match(modalityPattern)

    if (matches !== null) {
        if (matches.length > 1) {
            throw new Error("multiple modality codes not allowed")
        }

        const matchedModality = modalityPattern.exec(text)[1]

        result.modality = matchedModality.replace(/[""]/g, "")
    }

    return result
}

function searchOptions<DataType>(options?: fuse.FuseOptions<DataType>): (query: string, data: DataType[]) => DataType[] {
    return (query, data) => {
        const values = Array.from(data.values())

        const search = new fuse(values, {
            shouldSort: true,
            threshold: 0.25,
            location: 0,
            distance: 50,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            ...options
        })

        const results = search.search(query)

        if ("matches" in (results as any)) {
            return results as any
        } else {
            return results
        }
    }
}

const searchDirectory = searchOptions<Directory>({
    keys: ["header", "header.name"] as any
})

async function getAllListings(resourcePrefix: string, abs: string): Promise<Directory[]> {
    return ([] as Directory[]).concat(...await Promise.all(
        Object.keys(modalities).map(async modality => {
            console.debug("getting", abs, modality)
            const listing = await getListing(abs, modality)
            const fileInfos = await getFileInfo(abs, modality, listing)
            console.debug("done", abs, modality)

            return fileInfos.map(f => ({ ...f, url: `${resourcePrefix}/${modality}/${f.filename}`, modality: getModality(modality) }))
        })))
}

const router = express.Router()

router.get("/", async (req, res) => {
    const db = await database();

    if (!req.query.q) {
        res.send(db.value())
        return
    }

    const t = db.get("treatments")
    const d = db.get("diseases")

    res.send(searchDirectory(req.query.q, ([] as Directory[]).concat(...t.value(), ...d.value())))
})

export interface SearchResult {
    query: string,
    directory: string,
    results: Directory[]
}

export interface CategorizedSearchResult {
    query: string,
    directory: string,
    results: CategorizedSearchMap
}

export interface CategorizedSearchMap {
    [name: string]: {
        name: string,
        results: Directory[]
    }
}

function formatSearchResponse(query: string, directory: string, results: Directory[], categorize: boolean = false): SearchResult | CategorizedSearchResult {
    if (categorize) {
        return ({
            query: query,
            directory: directory,
            results: (results as Directory[]).reduce<CategorizedSearchMap>((acc, cur) => {
                const name = cur.modality.data.displayName

                if (!(name in acc)) {
                    acc[name] = {
                        name: name,
                        results: [cur]
                    }
                } else {
                    acc[name].results.push(cur)
                }

                return acc
            }, {})
        })
    } else {
        return ({
            query: query,
            directory: directory,
            results: results
        })
    }
}

router.get("/:sub", async (req, res) => {
    const {
        sub
    } = req.params

    const db = await database()

    if (!Object.keys(db.value()).includes(sub)) {
        res.sendStatus(404)
        return
    }

    const {
        q,
        categorize
    } = req.query

    const _categorize = typeof categorize === "undefined" ? false : categorize === "true";

    if (!q) {
        res.send(formatSearchResponse(q, sub, db.get(sub).value(), _categorize));
    } else {
        const values: Directory[] = db.get(sub).value()
        const results = searchDirectory(req.query.q, values)
        res.send(formatSearchResponse(q, sub, results, _categorize))
    }
})

export async function initialize() {
    const db = await database()

    console.debug("initializing")

    if (db.get("treatments").value().length !== 0) {
        console.debug("we done")
        return
    }

    const txs = await getAllListings(`${apiHostname}/tx`, config.relative.ibisRoot("system", "tx"))
    const rxs = await getAllListings(`${apiHostname}/rx`, config.relative.ibisRoot("system", "rx"))
    console.debug("got all the magic")

    db.get("diseases").splice(0, 0, ...txs).write()
    db.get("treatments").splice(0, 0, ...rxs).write()
    console.debug("finished mapping listings")
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

export default router
