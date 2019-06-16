import { spawn, ChildProcess } from "child_process";

export interface Options {
    command: string,
    args: string[],
    prefix?: string,
    timeout?: number,
    port_env: string
}

function spawnProcessOnInitializationMessage(options: Options, log: (...args: any[]) => void) {
    const {
        command,
        args,
        prefix,
        timeout = 5000
    } = options;

    function logPrefixed(d: any) {
        log(`${prefix}: ${d.toString()}`)
    }

    return new Promise<ChildProcess>((resolve, reject) => {
        const appUnderTest = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        })

        appUnderTest.on('message', () => resolve(appUnderTest))

        appUnderTest.stdout.on('data', logPrefixed)
        appUnderTest.stderr.on('data', logPrefixed)

        appUnderTest.on('exit', (code, signal) => {
            reject(`setup for ${prefix} unexpectedly closed with exit code ${code}`)
        })

        setTimeout(() => reject(`setup for '${prefix}' timed out (took more than ${timeout} ms to send initialization message)`), timeout)
    });
}

/**
 * Returns a AVA helper that runs an application under test.
 * @param {string} options.command The first argument used to invoke the app under test (See {@link spawn})
 */
export function withEntrypoint(options: Options) {
    const {
        port_env,
        prefix = "app",
    } = options;

    const id = Math.random().toString(36).substr(2, 9)

    const log = (...args: any[]) => process.stdout.write([`[${id}]`].concat(args).join(' '))

    return function helper(t: any, run: any) {
        log(`starting e2e test for ${prefix}`, JSON.stringify(options), '\n')

        const port = 8000 + Math.floor(Math.random() * 1000)

        process.env[port_env] = port.toString();

        return spawnProcessOnInitializationMessage(options, log)
            .then(async (app) => {
                try {
                    log(`starting ${prefix} test\n`)
                    await run(t, port, app);
                    log(`finished ${prefix} test\n`)
                } finally {
                    log(`tearing down ${prefix}\n`)
                    app.kill();
                }
            })
    }
}