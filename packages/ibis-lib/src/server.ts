import spdy from "spdy"
import http from "http"
import pem from "pem"
import { IncomingMessage, ServerResponse } from "http"
import program from "commander"
import { readFileSync } from "fs"

export interface ServerOptions {
    key?: string,
    cert?: string
}

const parseServerOptions = () => new Promise<ServerOptions>((resolve, reject) => {
    try {
        program
            .option("-k, --key [key]", "The HTTPs key to use. Can also be set via HTTPS_KEY_PATH.")
            .option("-c, --cert [cert]", "The HTTPs cert to use. Can also be set via HTTPS_CERT_PATH.")
            .parse(process.argv)

        const options = {
            key: program.key || process.env.HTTPS_KEY_PATH,
            cert: program.cert || process.env.HTTPS_CERT_PATH
        }

        console.log(options)

        resolve(options)
    } catch (e) {
        reject(e)
    }
})

const createServer = (app: (request: IncomingMessage, response: ServerResponse) => void, options?: spdy.ServerOptions) => new Promise<spdy.Server>((resolve, reject) => {
    if (options && options.key && options.cert) {
        resolve(spdy.createServer(options, app))
    } else {
        pem.createCertificate({
            days: 1,
            selfSigned: true
        }, (err, keys) => {
            if (err) {
                reject(err)
            } else {
                const serverOptions: spdy.ServerOptions = Object.assign({
                    key: keys.serviceKey,
                    cert: keys.certificate
                }, options)
                resolve(spdy.createServer(serverOptions, app))
            }
        })
    }
})

export const isHttpsEnabled = () => {
    return process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH;
}

export const h2 = async (app: (request: IncomingMessage, response: ServerResponse) => void) => {
    const options = await parseServerOptions()

    if (options.key && options.cert) {
        console.log('setting up https')
        return createServer(app, {
            key: readFileSync(options.key),
            cert: readFileSync(options.cert)
        })
    } else {
        console.log('setting up http')
        return Promise.resolve(http.createServer(app));
    }
}