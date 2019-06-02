import { Header, Modality, getModality, modalities } from "ibis-lib"
import { join } from "path"
import config, { apiHostname } from "./config"
import { getFileInfo, getListing } from "./file";

import BetterFileAsync from "./BetterFileAsync"
import { default as express, Router } from "express"
import fuse from "fuse.js"
import lowdb from "lowdb"

const adapter = new BetterFileAsync<Database>(join(process.cwd(), "db.json"), {
    defaultValue: {
        diseases: [],
        treatments: [],
    },
})

function database(): Promise<lowdb.LowdbAsync<Database>> {
    return lowdb(adapter)
}

/**
 * Default options used when searching using Fuse.
 */
const defaultFuseOptions = {
    shouldSort: true,
    threshold: 0.25,
    location: 0,
    distance: 50,
    maxPatternLength: 32,
    minMatchCharLength: 1,
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

        const match = modalityPattern.exec(text)
        const matchedModality = match[1]

        result.modality = matchedModality.replace(/[""]/g, "")
        result.text = result.text.replace(modalityPattern, '').trim()
    }

    return result
}

/**
 * Returns a filter that filters out {@link Directory} based on the {@link query}.
 * @param query A query
 */
export const directoryFilter = (query: Query) => (dir: Directory) => query.modality ? dir.modality.code === query.modality : true;

interface SearchOptions<T> extends fuse.FuseOptions<T> {
    f?: (query: Query) => (t: T) => boolean;
}

function searchOptions<DataType>(options?: SearchOptions<DataType>): (q: string, data: DataType[]) => DataType[] {
    return (q, data) => {
        if (!data) {
            return []
        }

        if (options && options.f) {
            var formattedQuery = query(q)
            var parsedModality = getModality(formattedQuery.modality);

            if (parsedModality) {
                data = data.filter(options.f({
                    text: formattedQuery.text,
                    modality: parsedModality.code
                }))
                q = formattedQuery.text
            }
        }

        const search = new fuse(data, { ...defaultFuseOptions, ...options})

        console.log('searching', data.length, 'entries on', `'${q}'`)

        return search.search(q)
    }
}

const searchDirectory = searchOptions<Directory>({
    keys: ["header", "header.name"] as any,
    f: directoryFilter
})

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

const router: Router = express.Router()

router.get("/", async (req, res) => {
    const db = await database();

    if (!req.query.q) {
        res.send(db.value())
        return
    } else {
        const t = db.get("treatments").value()
        const d = db.get("diseases").value()

        res.send(searchDirectory(req.query.q, [].concat(t, d)))
    }
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
    let searchResponse: SearchResult | CategorizedSearchResult = {
        query: query,
        directory: directory,
        results: null
    }

    if (!categorize) {
        searchResponse.results = results
    } else {
        searchResponse.results = results.reduce<CategorizedSearchMap>((acc, cur) => {
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
    }

    return searchResponse
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

    console.debug("initializing...")

    if (db.get("treatments").value().length !== 0) {
        console.debug("initialized (cached)")
        return
    }

    const txs = await getAllListings(`${apiHostname}/tx`, config.relative.ibisRoot("system", "tx"))
    const rxs = await getAllListings(`${apiHostname}/rx`, config.relative.ibisRoot("system", "rx"))
    console.debug("got all the magic")

    db.get("diseases").splice(0, 0, ...txs).write()
    db.get("treatments").splice(0, 0, ...rxs).write()
    console.debug("initialized")
    // get ALL the files everywhere
    // put them in the diseases/ tx/ rx
}

export default router
