import { router as db, SearchResult, query, directoryFilter } from "./db"
import { getModality } from "ibis-lib"

import bodyparser from "body-parser"
import express from "express"
import request from "supertest"
import test, { ExecutionContext } from "ava"

const getApp = () => {
    const app = express()
    app.use(bodyparser.json())
    app.use("/", db)
    return app
}

const getAppAndAssertResponse = (url: string, withResponse: (_: request.Response) => void) => 
    request(getApp()).get(url)
        .then((r) => {
            withResponse(r)
        })

test("db:app:/", (t) => 
    getAppAndAssertResponse("/", res => {
        t.is(res.status, 200)
        t.not(res.body, undefined)
    })
)

test("db:app:/:query", (t) =>
    getAppAndAssertResponse("/?q=string", res => {
        t.is(res.status, 200)
        t.not(res.body, undefined)
    })
)

test("db:app:/diseases", (t) => 
    getAppAndAssertResponse("/diseases", res => {
        t.is(res.status, 200)
        t.is((res.body as SearchResult).directory, "diseases")
    })
)

test("db:app:/treatments", (t) => 
    getAppAndAssertResponse("/treatments", res => {
        t.is(res.status, 200)
        t.is((res.body as SearchResult).directory, "treatments")
    })
)

test("db:app:/treatments:categorized", (t) => 
    getAppAndAssertResponse("/treatments?categorize=true", res => {
        t.is(res.status, 200)
        t.false(Array.isArray(res.body.results))
    })
)

test("db:app:/diseases:categorized", (t) =>
    getAppAndAssertResponse("/diseases?categorize=true", res => {
        t.is(res.status, 200)
        t.false(Array.isArray(res.body.results))
    })
)

test("db:app:/treatments:not categorized", (t) =>
    getAppAndAssertResponse("/treatments?categorize=false", res => {
        t.is(res.status, 200)
        t.true(Array.isArray(res.body.results))
    })
)

test("db:app:/diseases:not categorized", (t) =>
    getAppAndAssertResponse("/diseases?categorize=false", res => {
        t.is(res.status, 200)
        t.true(Array.isArray(res.body.results))
    })
)

test("db:app:/foobar", (t) => 
    getAppAndAssertResponse("/foobar", res => {
        t.is(res.status, 404)
    })
)

test("db:query:modality", (t) => {
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

test("db:directoryFilter:modality:false", (t) => {
    var f = directoryFilter({
        text: 'anything',
        modality: 'bota'
    })

    t.is(false, f({
        url: '',
        modality: getModality('home'),
        header: {
            version: '',
            tag: '',
            name: '',
            category: ''
        }
    }))
})

test("db:directoryFilter:modality:true", (t) => {
    var f = directoryFilter({
        text: 'anything',
        modality: 'bota'
    })

    t.is(true, f({
        url: '',
        modality: getModality('bota'),
        header: {
            version: '',
            tag: '',
            name: '',
            category: ''
        }
    }))
})
