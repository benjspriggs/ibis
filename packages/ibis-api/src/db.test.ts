import db, { SearchResult, query, directoryFilter } from "./db"
import { getModality } from "ibis-lib"

import bodyparser from "body-parser"
import express from "express"
import request from "supertest"
import test from "ava"

const getApp = () => {
    const app = express()
    app.use(bodyparser.json())
    app.use("/", db)
    return app
}

test("db:app:/", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/")

    t.is(res.status, 200)
    t.not(res.body, undefined)
})

test("db:app:/:query", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/?q=string")

    t.is(res.status, 200)
    t.not(res.body, undefined)
})

test("db:app:/diseases", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/diseases")

    t.is(res.status, 200)
    t.is((res.body as SearchResult).directory, "diseases")
})

test("db:app:/treatments", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/treatments")

    t.is(res.status, 200)
    t.is((res.body as SearchResult).directory, "treatments")
})

test("db:app:/treatments:categorized", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/treatments?categorize=true")

    t.is(res.status, 200)
    t.false(Array.isArray(res.body.results))
})

test("db:app:/diseases:categorized", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/diseases?categorize=true")

    t.is(res.status, 200)
    t.false(Array.isArray(res.body.results))
})

test("db:app:/treatments:not categorized", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/treatments?categorize=false")

    t.is(res.status, 200)
    t.true(Array.isArray(res.body.results))
})

test("db:app:/diseases:not categorized", async (t) => {
    t.plan(2)

    const res = await request(getApp()).get("/diseases?categorize=false")

    t.is(res.status, 200)
    t.true(Array.isArray(res.body.results))
})

test("db:app:/foobar", async (t) => {
    t.plan(1)

    const res = await request(getApp()).get("/foobar")

    t.is(res.status, 404)
})

test("db:query:modality", (t) => {
    t.deepEqual(query("foobar"), {
        text: "foobar",
    })

    t.deepEqual(query("term modality:bota"), {
        modality: "bota",
        text: "term modality:bota",
    }, "it has a long name")

    t.deepEqual(query("term m:bota"), {
        modality: "bota",
        text: "term m:bota",
    }, "it has shorthands")

    try {
        query("term m:bota m:vera")
        t.fail("must not allow multiple modality codes")
    } catch (_) {
        // ignore
    }

    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures double quotes")

    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures single quotes")

    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
    }, `it doesn"t capture words after quotes`)

    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
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
