import { getModality } from "ibis-lib"

import { default as express, Router } from "express"
import fuse from "fuse.js"

import { getTherapeutics, getMateriaMedica, Directory } from "./db"

const router: Router = express.Router()

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

const modalityPattern = /m(?:odality)?:(\w+|".*?"|".*?")/g

router.get("/", async (req, res) => {
    if (!req.query.q) {
        res.send({})
    } else {
        const t = await getMateriaMedica()
        const d = await getTherapeutics()

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

    let entries;

    switch (sub) {
        case "diseases":
            entries = await getTherapeutics()
            break;
        case "therapeutics":
            entries = await getMateriaMedica()
            break;
        default:
            res.sendStatus(404)
            return
    }

    const {
        q,
        categorize
    } = req.query

    const _categorize = typeof categorize === "undefined" ? false : categorize === "true";

    if (!q) {
        res.send(formatSearchResponse(q, sub, entries, _categorize));
    } else {
        const results = searchDirectory(req.query.q, entries)
        res.send(formatSearchResponse(q, sub, results, _categorize))
    }
})

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

const searchDirectory = searchOptions<Directory>({
    keys: ["header", "header.name"] as any,
    f: directoryFilter
})

interface SearchOptions<T> extends fuse.FuseOptions<T> {
    f?: (query: Query) => (t: T) => boolean;
}

export interface Query {
    text: string,
    modality?: string
}

export {
    router
}