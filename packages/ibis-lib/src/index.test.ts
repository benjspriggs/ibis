import { getModality } from "./index"

import test from "ava"

test("index:getModality:falsy", t => {
    t.falsy(getModality())
    t.falsy(getModality(''))
    t.falsy(getModality('foobarbaz'))
})

test("index:getModality:truthy", t => {
    t.truthy(getModality('bota'))
    t.truthy(getModality('vibr'))
})
