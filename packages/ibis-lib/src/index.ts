import { NextFunction, Request, RequestHandler } from "express"

export {
    h2,
    isHttpsEnabled
} from "./server"

export {
    withEntrypoint,
    Options
} from "./helpers"

export {
    applicationRoot
} from "./pkg"

export interface Modality {
    code: string,
    data: ModalityData
}

export interface ModalityData {
    displayName: string
}

export const modalities: { [code: string]: ModalityData } = {
    "acup": {
        displayName: "Acupuncture"
    },
    "bota": {
        displayName: "Botanical Medicine"
    },
    "chin": {
        displayName: "Chinese Medicine"
    },
    "diag": {
        displayName: "Diagnoses"
    },
    "home": {
        displayName: "Homeopathy"
    },
    "inte": {
        displayName: "Integrative Therapies"
    },
    "nutr": {
        displayName: "Nutrition"
    },
    "phys": {
        displayName: "Physical Medicine"
    },
    "psyc": {
        displayName: "Psychospiritual Approaches"
    },
    "vibr": {
        displayName: "Vibrational Therapies"
    },
}

export function getModality(codeOrDisplayName?: string): Modality {
    if (!codeOrDisplayName) {
        return
    }

    const lower = codeOrDisplayName.toLowerCase()

    if (lower in modalities) {
        return ({ code: lower, data: modalities[lower] });
    }

    const modalityCodePair = Object.entries(modalities).find(([_, modality]) => modality.displayName.toLowerCase() === codeOrDisplayName)

    if (modalityCodePair) {
        return ({ code: modalityCodePair[0], data: modalityCodePair[1] })
    } else {
        return
    }
}

export interface Header {
    version: string,
    tag: string,
    name: string,
    category: string
}

export const requestLogger: RequestHandler = (req: Request, _, next: NextFunction) => {
    console.log(JSON.stringify(
        {
            host: req.hostname,
            version: req.httpVersion,
            ip: req.ip,
            date: new Date(),
            path: req.path,
            query: req.query,
            "user-agent": req.headers["user-agent"],
        }))
    next()
}
