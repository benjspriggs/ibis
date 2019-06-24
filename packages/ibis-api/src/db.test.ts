import test from "ava"

import { getDirectoryIdentifier } from "./db"

test("search:formatSearchDirectory:based off id", (t) => {
    t.is("/treatments/acup/entryID", getDirectoryIdentifier({
        id: "entryID",
        modality: {
            code: "acup",
            data: {
                "displayName": ""
            }
        },
        category: "treatments",
    }))
})