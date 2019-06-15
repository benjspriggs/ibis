import { appHostname, hostname, port } from "./config"
import { h2 } from "ibis-lib"

import app from "./app"

export const start = () => h2(app)
        .then(server => {
                console.log(`Listening on ${appHostname}`)
                server.listen(port, hostname)
                process.send && process.send("initialized")
        })
