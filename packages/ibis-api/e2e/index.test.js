// @ts-check
import { withEntrypoint } from "ibis-lib"
import test from "ava";
import { join } from "path";
import { get } from "request";

const port = 3000 + Math.floor(Math.random() * 100)

process.env.API_PORT = port.toString();

const withApi = withEntrypoint({
    command: "node", 
    args: [join(__dirname, "..", "start.js")],
    prefix: "api (js)"
})

test("It should serve a 200 for root", withApi, async (t, api) => {
    await new Promise((resolve, reject) => {
        get(`http://localhost:${port}`)
            .on('response', (response) => {
                t.is(200, response.statusCode)
                t.truthy(response.headers)
                resolve()
            })
            .on('error', reject)
    });
})