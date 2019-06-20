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

function handleSocketErrorCodes(resolve: (_: boolean) => void, reject: (_: any) => void) {
    return (e: any) => {
        switch ((e as any).code) {
            case "ECONNREFUSED":
                resolve(true);
                break;
            case "EADDRINUSE":
                resolve(false);
                break;
            default:
                reject(e);
                break;
        }
    }
}

/**
 * @returns {Promise<boolean>} A resolved promise with whether that port is open.
 */
function isOpenPort({ host, port, timeout = 5000 }: { host: string, port: number, timeout?: number }) {
    var socket = new Socket()

    socket.setTimeout(timeout)

    return new Promise<boolean>((resolve, reject) => {
        socket.once('error', handleSocketErrorCodes(resolve, reject))

        socket.once('timeout', () => {
            socket.destroy()
            resolve(true)
        })

        socket.connect({
            port: port,
            host: host
        }, () => {
            socket.end()
            resolve(false)
        })
    })
}

async function getOpenPort({ host, start, range, timeout = 5000, maxTries = 3 }: { host: string, start: number, range: number, timeout?: number, maxTries?: number }): Promise<number> {
    let tries = 0;
    const getPort = () => start + Math.floor(Math.random() * range)

    do {
        tries += 1;

        let port = getPort()

        if (await isOpenPort({ host, port, timeout })) {
            return port;
        }
    } while (tries < maxTries);

    throw new Error(`max number of tries used attempting to get an open port: ${maxTries}`)
}

function logMessage(log: (args: any[]) => void) {
    return (d: any) => log(d.toString())
}

function spawnProcessOnInitializationMessage(options: Options, log: (...args: any[]) => void) {
    const {
        host = "0.0.0.0",
        timeout = 5000,
    } = options;

    log(`running in CI environment? ${isRunningInContinuousIntegrationEnvironment()}\n`)

    const adjustedTimeout = isRunningInContinuousIntegrationEnvironment() ? timeout + 5000 : timeout

    return new Promise<{ app: ChildProcess, port: number }>(async (resolve, reject) => {
        const port = await getOpenPort({ host: host, start: 8000, range: 100 });

        const appUnderTest = spawn(options.command, options.args, {
            env: { ...process.env, [options.host_env]: host, [options.port_env]: port.toString() },
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        setTimeout(() => reject(`setup for '${options.prefix}' timed out (took more than ${adjustedTimeout} ms to send initialization message)`), adjustedTimeout);

        appUnderTest.on('message', (...args: any[]) => {
            log(`recieved message, assuming that app has initialized: ${JSON.stringify(args)}\n`);
            resolve({ app: appUnderTest, port: port });
        });
        appUnderTest.stdout.on('data', logMessage(log));
        appUnderTest.stderr.on('data', logMessage(log));
        appUnderTest.on('exit', (code, signal) => {
            reject(`setup for ${options.prefix} unexpectedly closed with exit code ${code}`);
        });
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