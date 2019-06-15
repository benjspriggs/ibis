// @ts-check
import colors from "colors";
import test from "ava";
import { spawn } from "child_process";
import { join } from "path";
import { get } from "request";

function withPkg(t, run) {
    const apiEntrypoint = join(__dirname, "..", "start.js")
    console.debug("starting api e2e test from", apiEntrypoint.blue)

    return new Promise((resolve, reject) => {
        const api = spawn("node", [apiEntrypoint], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        })

        api.stdout.on('data', (d) => console.log(`api: ${d.toString().blue}`))
        api.stderr.on('data', (e) => console.error(`api: ${e.toString().red}`))

        api.on('exit', (code, signal) => {
            console.log("executable ended with code".yellow, code, signal)
        })

        api.on('message', () => resolve(api))

        setTimeout(() => reject("API setup timed out"), 2000)
    }).then(async (api) => {
        try {
            console.log("starting api test".green)
            await run(t, api);
            console.log("finished api test".green)
        } finally {
            console.log("tearing down api".green)
            api.kill();
        }
    })
}

test("It it should serve a 200 for root", withPkg, async (t, api) => {
    await new Promise((resolve, reject) => {
        get("http://localhost:3000")
            .on('response', (response) => {
                t.is(200, response.statusCode)
                t.truthy(response.headers)
                resolve()
            })
            .on('error', reject)
    });
})
