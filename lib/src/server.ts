import spdy from "spdy"
import pem from "pem"
import { IncomingMessage, ServerResponse } from "http"

export const createServer = (app: (request: IncomingMessage, response: ServerResponse) => void, options?: spdy.ServerOptions) => new Promise<spdy.Server>((resolve, reject) => {
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
})