import { spawn, ChildProcess } from "child_process";

export interface Options {
    command: string,
    args: string[],
    prefix?: string,
    timeout?: number
}

function spawnProcessOnInitializationMessage(options: Options) {
    const {
        command,
        args,
        prefix,
        timeout = 2000
    } = options;

    function logPrefixed(d: any) {
        console.log(`${prefix}: ${d.toString()}`)
    }

    return new Promise<ChildProcess>((resolve, reject) => {
        const appUnderTest = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        })

        appUnderTest.stdout.on('data', logPrefixed)
        appUnderTest.stderr.on('data', logPrefixed)

        appUnderTest.on('exit', (code, signal) => {
            console.log("executable ended with code", code, signal)

            if (code > 0) {
                reject(`setup for ${prefix} failed with code ${code}`)
            }
        })

        appUnderTest.on('message', () => resolve(appUnderTest))

        setTimeout(() => reject(`setup for '${prefix}' timed out (${timeout} ms)`), timeout)
    });
}

/**
 * Returns a AVA helper that runs an application under test.
 * @param {string} options.command The first argument used to invoke the app under test (See {@link spawn})
 */
export function withEntrypoint(options: Options) {
    const {
        prefix = "app",
    } = options;

    return function helper(t: any, run: any) {
        console.debug(`starting e2e test for ${prefix}`, JSON.stringify(options))

        return spawnProcessOnInitializationMessage(options)
            .then(async (app) => {
                try {
                    console.log(`starting ${prefix} test`)
                    await run(t, app);
                    console.log(`finished ${prefix} test`)
                } finally {
                    console.log(`tearing down ${prefix}`)
                    app.kill();
                }
            })
    }
}