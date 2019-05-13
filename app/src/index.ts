import { appHostname, hostname, port } from "./config"
import { createServer } from "ibis-lib"

import app from "./app"

createServer(app)
    .then(server => {
        console.log(`Listening on ${appHostname}`)
        server.listen(port, hostname)
    })
