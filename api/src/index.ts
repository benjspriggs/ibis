import { apiHostname, hostname, port } from "./config"
import app, { initialize } from "./app"
import { createServer, applicationRoot, parseServerOptions } from "ibis-lib"

export { port, hostname, apiHostname, default as config } from "./config"
export { SearchResult, CategorizedSearchMap, CategorizedSearchResult } from "./db"

import fs from "fs"

export default () => {
    parseServerOptions()
        .then(options => {
            return createServer(app, {
                key: fs.readFileSync(options.key),
                cert: fs.readFileSync(options.cert),
            })
        })
        .then(async server => {
            await initialize()
            server.listen(port, hostname)
            console.log(`Listening on ${apiHostname}`)
        })
}
