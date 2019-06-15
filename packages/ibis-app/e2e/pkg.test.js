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

process.env.APP_PORT = port.toString();

const withApp = withEntrypoint({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "app (pkg)"
})

test("It should serve a 200 for root", withApp, async (t) => {
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
