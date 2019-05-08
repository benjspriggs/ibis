var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import db, { query } from "./db";
import bodyparser from "body-parser";
import express from "express";
import request from "supertest";
import test from "ava";
const getApp = () => {
    const app = express();
    app.use(bodyparser.json());
    app.use("/", db);
    return app;
};
test("db:app:/", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/");
    t.is(res.status, 200);
    t.not(res.body, undefined);
}));
test("db:app:/:query", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/?q=string");
    t.is(res.status, 200);
    t.not(res.body, undefined);
}));
test("db:app:/diseases", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/diseases");
    t.is(res.status, 200);
    t.is(res.body.directory, "diseases");
}));
test("db:app:/treatments", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/treatments");
    t.is(res.status, 200);
    t.is(res.body.directory, "treatments");
}));
test("db:app:/treatments:categorized", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/treatments?categorize=true");
    t.is(res.status, 200);
    t.false(Array.isArray(res.body.results));
}));
test("db:app:/diseases:categorized", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/diseases?categorize=true");
    t.is(res.status, 200);
    t.false(Array.isArray(res.body.results));
}));
test("db:app:/treatments:not categorized", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/treatments?categorize=false");
    t.is(res.status, 200);
    t.true(Array.isArray(res.body.results));
}));
test("db:app:/diseases:not categorized", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(2);
    const res = yield request(getApp()).get("/diseases?categorize=false");
    t.is(res.status, 200);
    t.true(Array.isArray(res.body.results));
}));
test("db:app:/foobar", (t) => __awaiter(this, void 0, void 0, function* () {
    t.plan(1);
    const res = yield request(getApp()).get("/foobar");
    t.is(res.status, 404);
}));
test("db:query:modality", (t) => {
    t.deepEqual(query("foobar"), {
        text: "foobar",
    });
    t.deepEqual(query("term modality:bota"), {
        modality: "bota",
        text: "term modality:bota",
    }, "it has a long name");
    t.deepEqual(query("term m:bota"), {
        modality: "bota",
        text: "term m:bota",
    }, "it has shorthands");
    try {
        query("term m:bota m:vera");
        t.fail("must not allow multiple modality codes");
    }
    catch (_) {
        // ignore
    }
    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures double quotes");
    t.deepEqual(query(`term m:"string modality"`), {
        modality: "string modality",
        text: `term m:"string modality"`,
    }, "it captures single quotes");
    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
    }, `it doesn"t capture words after quotes`);
    t.deepEqual(query(`term m:"string modality" word`), {
        modality: "string modality",
        text: `term m:"string modality" word`,
    }, `it doesn"t capture words after quotes`);
});
//# sourceMappingURL=db.test.js.map