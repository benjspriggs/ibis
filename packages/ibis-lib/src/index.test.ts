import test from "ava"

import { getModality, modalities } from "./index"

test("index:getModality", (t) => {
    const acup = "acup"

    t.not(getModality(acup), undefined);
    t.is(getModality(acup).data.displayName, modalities[acup].displayName)
})