import { default as express } from "express"
import { Modality, getModality } from "ibis-lib";
import { Entry, getMonographMetaContent, getMonographContent, getTreatmentContent, getTreatmentMetaContent } from "./db"
import isEmpty from "lodash/isEmpty"
import { formatSearchDirectory, SearchDirectory } from "./search";

const router = express.Router()

async function getModalityResponse(options: {
    category: string,
    modality: string,
}) : Promise<{
    modality: Modality
    empty: boolean,
    meta: SearchDirectory[]
}> {
    if (!options) {
        throw new Error("options required for `getModalityResponse`")
    }

    let entries;

    switch (options.category) {
        case "treatments":
        case "diseases":
        case "therapeutics":
            entries = await getTreatmentMetaContent()
            break;
        case "monographs":
            entries = await getMonographMetaContent()
            break;
        default:
            throw new Error(`unknown category ${options.category}`)
    }

    const meta = entries.map(formatSearchDirectory)

    const empty = meta.filter((infoObject) => isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === "undefined"))

    return {
        modality: getModality(options.modality),
        empty: !isEmpty(empty),
        meta: meta
    }
}

async function getEntryResponse(options: {
    category: string,
    id: string,
    modality: string
}): Promise<Entry> {
    if (!options) {
        throw new Error("options required for `getEntryResponse`")
    }

    const modalityCode = getModality(options.modality).code

    const predicate = (entry: Entry) => entry.id === options.id && entry.modality.code === modalityCode

    let response;

    switch (options.category) {
        case "diseases":
        case "treatments":
        case "therapeutics":
            response = (await getTreatmentContent(predicate))[0]
            break;
        case "monographs":
            response = (await getMonographContent(predicate))[0]
            break;
        default:
            throw new Error(`unknown category ${options.category}`)
    }

    if (!response) {
        throw new Error("unable to find entry")
    }

    return response
}

router.get("/", (req, res) => {
    res.status(204)
    res.send()
})

router.get('/:category/:modality/:id', (req, res, next) => {
    return getEntryResponse(req.params)
        .then(response => res.send(response))
        .catch(() => res.sendStatus(404))
})

router.get('/:category/:modality', (req, res, next) => {
    return getModalityResponse(req.params)
        .then(response => res.send(response))
        .catch(() => res.sendStatus(404))
})

export {
    router
}
