import { default as express } from "express"
import { Modality, Header, getModality } from "ibis-lib";
import { Entry, getMateriaMedica, getTherapeutics, getMateriaMedicaContent, getTherapeuticContent } from "./db"
import isEmpty from "lodash/isEmpty"

const router = express.Router()

async function getModalityResponse(options: {
    category: string,
    modality: string,
}) : Promise<{
    modality: Modality
    empty: boolean,
    meta: {
        filepath: {
            relative: string,
            absolute: string
        },
        id: string,
        header: Header
    }[],
}> {
    if (!options) {
        throw new Error("options required for `getModalityResponse`")
    }

    let entries;

    switch (options.category) {
        case "rx":
        case "materia-medica":
            entries = await getMateriaMedica()
            break;
        case "tx":
        case "therapeutics":
            entries = await getTherapeutics()
            break;
        default:
            throw new Error(`unknown category ${options.category}`)
    }

    const meta = entries

    const empty = meta.filter((infoObject) => isEmpty(infoObject.header) || Object.values(infoObject.header).some(val => typeof val === "undefined"))

    return {
        modality: getModality(options.modality),
        empty: !isEmpty(empty),
        meta: meta.map(entry => ({
            ...entry,
            filepath: {
                relative: "",
                absolute: ""
            }
        }))
    }
}

async function getEntryResponse(options: {
    category: string,
    id: string,
    modality: string
}): Promise<Entry> {
    if (!options) {
        throw new Error("options required for `getModalityResponse`")
    }

    const predicate = (entry: Entry) => entry.id === options.id && entry.modality === getModality(options.modality)

    switch (options.category) {
        case "rx":
        case "materia-medica":
            return (await getMateriaMedicaContent(predicate))[0]
        case "tx":
        case "therapeutics":
            return (await getTherapeuticContent(predicate))[0]
        default:
            throw new Error(`unknown category ${options.category}`)
    }

}

router.get('/:category/:modality', (req, res, next) => {
    getModalityResponse(req.params)
        .then(response => res.send(response))
        .catch(() => next())
})

router.get('/:category/:modality/:id', (req, res, next) => {
    getEntryResponse(req.params)
        .then(response => res.send(response))
        .catch(() => next())
})

export {
    router
}
