import { spawn, ChildProcess } from "child_process";
import { randomBytes } from "crypto";

export interface Options {
    command: string,
    args: string[],
    prefix?: string,
    timeout?: number,
    port_env: string
}

function isRunningInContinuousIntegrationEnvironment() {
    return process.env["CI"] && process.env.CI === "true"
}

function spawnProcessOnInitializationMessage(options: Options, log: (...args: any[]) => void) {
    const {
        command,
        args,
        prefix,
        timeout = 5000,
        port_env
    } = options;

    function logMessage(d: any) {
        log(d.toString())
    }

    log(`running in CI environment? ${isRunningInContinuousIntegrationEnvironment()}\n`)

    const adjustedTimeout = isRunningInContinuousIntegrationEnvironment() ? timeout + 5000 : timeout

    return new Promise<{ app: ChildProcess, port: number}>((resolve, reject) => {
        const port = 8000 + Math.floor(Math.random() * 1000)

        const env = { ...process.env, [port_env]: port.toString() }

        const appUnderTest = spawn(command, args, {
            env: env,
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        })

        appUnderTest.on('message', () => resolve({ app: appUnderTest, port: port }))

        appUnderTest.stdout.on('data', logMessage)
        appUnderTest.stderr.on('data', logMessage)

        appUnderTest.on('exit', (code, signal) => {
            reject(`setup for ${prefix} unexpectedly closed with exit code ${code}`)
        })

        setTimeout(() => reject(`setup for '${prefix}' timed out (took more than ${adjustedTimeout} ms to send initialization message)`), adjustedTimeout)
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
        const id = randomBytes(10).toString('base64')

        const log = (...args: any[]) => process.stdout.write([`[${id}]`].concat(args).join(' '))

        log(`starting e2e test for ${prefix}`, JSON.stringify(options), '\n')

        return spawnProcessOnInitializationMessage(options, log)
            .then(async ({ app, port }) => {
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