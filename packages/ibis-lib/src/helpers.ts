import { spawn, ChildProcess } from "child_process";
import { randomBytes } from "crypto";
import { Socket } from "net"

export interface Options {
    command: string,
    args: string[],
    prefix?: string,
    timeout?: number,
    host?: string,
    port_env: string,
    host_env: string
}

function isRunningInContinuousIntegrationEnvironment() {
    return (process.env.CI && process.env.CI === "true") || false
}

/**
 * @returns {Promise<boolean>} A resolved promise with whether that port is open.
 */
function isOpenPort(host: string, port: number, timeout: number = 5000) {
    return new Promise((resolve, reject) => {
        var socket = new Socket()

        socket.setTimeout(timeout)
        socket.once('error', (e) => {
            socket.destroy()
            switch ((e as any).code) {
                case "ECONNREFUSED":
                    resolve(true);
                    break;
                case "EADDRINUSE":
                    resolve(false);
                    break;
                default:
                    console.error(`unknown error code '${(e as any).code}' connecting to '${host}' on port '${port}'`)
                    reject(e);
                    break;
            }
        })

        socket.once('timeout', () => {
            socket.destroy()
            resolve(true)
        })

        try {
            socket.connect({
                port: port,
                host: host
            }, () => {
                socket.end()
                resolve(false)
            })
        } catch(e) {
            socket.destroy()
            reject(e)
        }
    })
}

async function getOpenPort(host: string, start: number, range: number, timeout: number = 5000, maxTries: number = 3): Promise<number> {
    let tries = 0;
    const getPort = () => start + Math.floor(Math.random() * range)

    do {
        tries += 1;

        let port = getPort()

        if (await isOpenPort(host, port, timeout)) {
            return port;
        }
    } while (tries < maxTries);

    throw new Error(`max number of tries used attempting to get an open port: ${maxTries}`)
}

function spawnProcessOnInitializationMessage(options: Options, log: (...args: any[]) => void) {
    const {
        command,
        host = "0.0.0.0",
        args,
        prefix,
        timeout = 5000,
        host_env,
        port_env
    } = options;

    function logMessage(d: any) {
        log(d.toString())
    }

    log(`running in CI environment? ${isRunningInContinuousIntegrationEnvironment()}\n`)

    const adjustedTimeout = isRunningInContinuousIntegrationEnvironment() ? timeout + 5000 : timeout

    return new Promise<{ app: ChildProcess, port: number }>((resolve, reject) => {
        return getOpenPort(host, 8000, 100)
            .then((port) => {
                const env = { ...process.env, [host_env]: host, [port_env]: port.toString() }

                const appUnderTest = spawn(command, args, {
                    env: env,
                    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
                })

                appUnderTest.on('message', (...args: any[]) =>{
                    log(`recieved message, assuming that app has initialized: ${JSON.stringify(args)}`)

                    isOpenPort(host, port)
                        .then(() => resolve({ app: appUnderTest, port: port }))
                        .catch(reject)
                })

                appUnderTest.stdout.on('data', logMessage)
                appUnderTest.stderr.on('data', logMessage)

                appUnderTest.on('exit', (code, signal) => {
                    reject(`setup for ${prefix} unexpectedly closed with exit code ${code}`)
                })

                setTimeout(() => reject(`setup for '${prefix}' timed out (took more than ${adjustedTimeout} ms to send initialization message)`), adjustedTimeout)
            })
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

        log(`starting e2e test for ${prefix} - '${t.title}'`, JSON.stringify(options), '\n')

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