// @ts-check
import { withEntrypoint } from "ibis-lib"
import test from "ava";
import { join } from "path";
import { get } from "request";

let entryPoint;

switch (process.platform) {
    case "darwin":
        entryPoint = "start-macos";
        break;
    case "win32":
        entryPoint = "start-win.exe";
        break;
    default:
        entryPoint = "start-linux";
        break;
}

const port = 3000 + Math.floor(Math.random() * 100)

process.env.API_PORT = port.toString();

const withApi = withEntrypoint({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "api (pkg)"
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
