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
            .option("-k, --key [key]", "The HTTPs key to use")
            .option("-c, --cert [cert]", "The HTTPs cert to use")
            .parse(process.argv)

        resolve(program as ServerOptions)
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