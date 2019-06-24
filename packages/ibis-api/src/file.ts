import { default as express } from "express"
import { Modality, getModality } from "ibis-lib";
import { Directory, Entry, getMetaContent, getCategoryFromRequestString, getContent } from "./db"
import isEmpty from "lodash/isEmpty"
import { formatSearchDirectory, SearchDirectory } from "./search";

const router = express.Router()

function shouldIncludeDirectory(modality: Modality, directory: Directory): boolean {
    return directory.modality.code === modality.code
}

function shouldIncludeEntry(modality: Modality, id: string, entry: Entry): boolean {
    return shouldIncludeDirectory(modality, entry) && id === entry.id
}

/**
 * Mostly used for debug purposes. What purposes?
 * Who knows.
 * @author benspriggs
 */
function isResponseEmpty(entries: SearchDirectory[]): boolean {
    const emptyEntries = entries
        .filter((infoObject) => isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === "undefined"))

    return !isEmpty(emptyEntries)
}

async function handleRequest(options: {
    category: string,
    modality: string,
    id?: string
}): Promise<Entry | {
    modality: Modality
    empty: boolean,
    meta: SearchDirectory[]
}> {
    if (!options.category || !options.modality) {
        throw new Error("missing category or modality")
    }

    const matchedCategory = getCategoryFromRequestString(options.category)

    const matchedModality = getModality(options.modality)

    if (!matchedModality) {
        throw new Error(`unknown modality '${options.modality}'`)
    }

    if (options.id) {
        const entries = await getContent(matchedCategory, (e) => shouldIncludeEntry(matchedModality, options.id, e))

        return entries[0]
    } else {
        const entries = await getMetaContent(matchedCategory, (d: Directory) => shouldIncludeDirectory(matchedModality, d))

        const meta = entries.map(formatSearchDirectory)

        return {
            modality: matchedModality,
            meta,
            empty: isResponseEmpty(meta)
        }
    }
}

router.get("/", (req, res) => {
    res.status(204)
    res.send()
})

router.get('/:category/:modality/:id?', (req, res, next) => {
    return handleRequest(req.params)
        .then(response => res.send(response))
        .catch(() => res.sendStatus(404))
})

export {
    router
}
