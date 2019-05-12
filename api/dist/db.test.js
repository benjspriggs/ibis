"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importStar(require("./db"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const ava_1 = __importDefault(require("ava"));
const getApp = () => {
    const app = express_1.default();
    app.use(body_parser_1.default.json());
    app.use("/", db_1.default);
    return app;
};
ava_1.default("db:app:/", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/");
    t.is(res.status, 200);
    t.not(res.body, undefined);
});
ava_1.default("db:app:/:query", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/?q=string");
    t.is(res.status, 200);
    t.not(res.body, undefined);
});
ava_1.default("db:app:/diseases", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/diseases");
    t.is(res.status, 200);
    t.is(res.body.directory, "diseases");
});
ava_1.default("db:app:/treatments", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/treatments");
    t.is(res.status, 200);
    t.is(res.body.directory, "treatments");
});
ava_1.default("db:app:/treatments:categorized", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/treatments?categorize=true");
    t.is(res.status, 200);
    t.false(Array.isArray(res.body.results));
});
ava_1.default("db:app:/diseases:categorized", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/diseases?categorize=true");
    t.is(res.status, 200);
    t.false(Array.isArray(res.body.results));
});
ava_1.default("db:app:/treatments:not categorized", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/treatments?categorize=false");
    t.is(res.status, 200);
    t.true(Array.isArray(res.body.results));
});
ava_1.default("db:app:/diseases:not categorized", async (t) => {
    t.plan(2);
    const res = await supertest_1.default(getApp()).get("/diseases?categorize=false");
    t.is(res.status, 200);
    t.true(Array.isArray(res.body.results));
});
ava_1.default("db:app:/foobar", async (t) => {
    t.plan(1);
    const res = await supertest_1.default(getApp()).get("/foobar");
    t.is(res.status, 404);
});
ava_1.default("db:query:modality", (t) => {
    t.deepEqual(db_1.query("foobar"), {
        text: "foobar",
    });
    t.deepEqual(db_1.query("term modality:bota"), {
        modality: "bota",
        text: "term modality:bota",
    }, "it has a long name");
    t.deepEqual(db_1.query("term m:bota"), {
        modality: "bota",
        text: "term m:bota",
    }, "it has shorthands");
    try {
        db_1.query("term m:bota m:vera");
        t.fail("must not allow multiple modality codes");
    }
    catch (_) {
        // ignore
    }
    t.deepEqual(db_1.query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures double quotes");
    t.deepEqual(db_1.query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures single quotes");
    t.deepEqual(db_1.query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
    }, `it doesn"t capture words after quotes`);
    t.deepEqual(db_1.query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
    }, `it doesn"t capture words after quotes`);
});
