import { spawn, ChildProcess } from "child_process";

export interface Options {
    command: string,
    args: string[],
    prefix?: string,
    timeout?: number
}

/**
 * Returns a AVA helper that runs an application under test.
 * @param {string} options.command The first argument used to invoke the app under test (See {@link spawn})
 */
export function withEntrypoint(options: Options) {
    const {
        command,
        args,
        prefix = "app",
        timeout = 2000
    } = options;

    return function helper(t: any, run: any) {
        console.debug(`starting e2e test for ${prefix}`, JSON.stringify(options))

        return new Promise<ChildProcess>((resolve, reject) => {
            const appUnderTest = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc']
            })

            appUnderTest.stdout.on('data', (d) => console.log(`${prefix}: ${d.toString()}`))
            appUnderTest.stderr.on('data', (e) => console.error(`${prefix}: ${e.toString()}`))

            appUnderTest.on('exit', (code, signal) => {
                console.log("executable ended with code", code, signal)
            })

            appUnderTest.on('message', () => resolve(appUnderTest))

            setTimeout(() => reject(`setup for '${prefix}' timed out (${timeout} ms)`), timeout)
        }).then(async (app) => {
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