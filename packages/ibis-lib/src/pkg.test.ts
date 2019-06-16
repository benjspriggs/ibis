import test from "ava"

import { applicationRoot, pkgOptions } from "./pkg"
import { join } from "path";
import { AssertionError } from "assert";

const clearPackage = () => {
    delete (process as any).pkg;

    if (!!(process as any).pkg) {
        throw new AssertionError({
            message: "package not cleared"
        });
    }
}

const makePackaged = (options: pkgOptions) => {
    (process as any).pkg = options;
}

test.beforeEach(clearPackage)

test("pkg:applicationRoot:is root of source when unpackaged", (t) => {
    t.is(join(__dirname, "..", ".."), applicationRoot())
})

test("pkg:applicationRoot:is root of packaged application", (t) => {
    const entrypoint = "/snapshot/project/app.js"

    makePackaged({
        entrypoint: entrypoint,
        defaultEntrypoint: entrypoint
    });

    t.is("/snapshot/project", applicationRoot())
})