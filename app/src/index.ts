import { appHostname, hostname, port } from "./config"
import { createServer, parseServerOptions } from "ibis-lib"

import app from "./app"
import fs from "fs"

parseServerOptions()
        .then(options => {
                return createServer(app, {
                        key: fs.readFileSync(options.key),
                        cert: fs.readFileSync(options.cert)
                })
        })
        .then(server => {
                console.log(`Listening on ${appHostname}`)
                server.listen(port, hostname)
        })
