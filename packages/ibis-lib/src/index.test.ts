import test from "ava"

import { getModality, modalities } from "./index"

test("index:getModality:falsy", t => {
    t.falsy(getModality())
    t.falsy(getModality(''))
    t.falsy(getModality('foobarbaz'))
})

test("index:getModality:truthy", t => {
    t.truthy(getModality('bota'))
    t.truthy(getModality('vibr'))
})

test("index:getModality", (t) => {
    const acup = "acup"

    t.not(getModality(acup), undefined);
    t.is(getModality(acup).data.displayName, modalities[acup].displayName)
})
