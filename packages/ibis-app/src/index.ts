import { appHostname, hostname, port } from "./config"
import { h2 } from "ibis-lib"

import app from "./app"

h2(app)
        .then(server => {
                console.log(`Listening on ${appHostname}`)
                server.listen(port, hostname)
        })
