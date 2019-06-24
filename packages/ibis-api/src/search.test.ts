import { router as search, SearchResult, query, directoryFilter } from "./search"
import { getModality } from "ibis-lib"

import bodyparser from "body-parser"
import express from "express"
import request from "supertest"
import test from "ava"

const getApp = () => {
    const app = express()
    app.use(bodyparser.json())
    app.use("/", search)
    return app
}

const getAppAndAssertResponse = (url: string, withResponse: (_: request.Response) => Promise<void>) =>
    request(getApp()).get(url)
        .then((r) => {
            return withResponse(r)
        })

test("search:app:/", async (t) =>
    await getAppAndAssertResponse("/", async res => {
        t.is(res.status, 204)
    })
)

test("search:app:/:query", async (t) =>
    await getAppAndAssertResponse("/?q=string", async res => {
        t.is(res.status, 200)
        t.not(res.body, undefined)
    })
)

test("search:app:/diseases", async (t) =>
    await getAppAndAssertResponse("/diseases", async res => {
        t.is(res.status, 200)
        t.is((res.body as SearchResult).directory, "diseases")
    })
)

test("search:app:/treatments", async (t) =>
    await getAppAndAssertResponse("/treatments", async res => {
        t.is(res.status, 200)
        t.is((res.body as SearchResult).directory, "treatments")
    })
)

test("search:app:/treatments:categorized", async (t) =>
    await getAppAndAssertResponse("/treatments?categorize=true", async res => {
        t.is(res.status, 200)
        t.false(Array.isArray(res.body.results))
    })
)

test("search:app:/diseases:categorized", async (t) =>
    await getAppAndAssertResponse("/diseases?categorize=true", async res => {
        t.is(res.status, 200)
        t.false(Array.isArray(res.body.results))
    })
)

test("search:app:/treatments:not categorized", async (t) =>
    await getAppAndAssertResponse("/treatments?categorize=false", async res => {
        t.is(res.status, 200)
        t.true(Array.isArray(res.body.results))
    })
)

test("search:app:/diseases:not categorized", async (t) =>
    getAppAndAssertResponse("/diseases?categorize=false", async res => {
        t.is(res.status, 200)
        t.true(Array.isArray(res.body.results))
    })
)

test("search:app:/foobar", async (t) =>
    await getAppAndAssertResponse("/foobar", async res => {
        t.is(res.status, 404)
    })
)

test("search:query:modality", (t) => {
    t.deepEqual(query("foobar"), {
        text: "foobar",
    })

    t.deepEqual(query("term modality:bota"), {
        modality: "bota",
        text: "term",
    }, "it has a long name")

    t.deepEqual(query("term m:bota"), {
        modality: "bota",
        text: "term",
    }, "it has shorthands")

    try {
        query("term m:bota m:vera")
        t.fail("must not allow multiple modality codes")
    } catch (_) {
        // ignore
    }

    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term`,
    }, "it captures double quotes")

    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term`,
    }, "it captures single quotes")

    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term  word`,
    }, `it doesn"t capture words after quotes`)

    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term  word`,
    }, `it doesn"t capture words after quotes`)
})

test("search:directoryFilter:modality:false", (t) => {
    var f = directoryFilter({
        text: 'anything',
        modality: 'bota'
    })

    t.is(false, f({
        id: '',
        category: "treatments",
        modality: getModality('home'),
        header: {
            version: '',
            tag: '',
            name: '',
            category: ''
        }
    }))
})

test("search:directoryFilter:modality:true", (t) => {
    var f = directoryFilter({
        text: 'anything',
        modality: 'bota'
    })

    t.is(true, f({
        id: '',
        category: "treatments",
        modality: getModality('bota'),
        header: {
            version: '',
            tag: '',
            name: '',
            category: ''
        }
    }))
})
