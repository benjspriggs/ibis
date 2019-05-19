import test from "ava"

import { getModality, modalities } from "./common"

test("common:getModality", (t) => {
    const acup = "acup"

    t.not(getModality(acup), undefined);
    t.is(getModality(acup).data.displayName, modalities[acup].displayName)
})