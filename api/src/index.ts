import { apiHostname, hostname, port } from "./config"
import app, { initialize } from "./app"
import { createServer } from "ibis-lib"

export { port, hostname, apiHostname, default as config } from "./config"
export { SearchResult, CategorizedSearchMap, CategorizedSearchResult } from "./db"

export default () => {
    createServer(app)
        .then(async (server) => {
            await initialize()
            server.listen(port, hostname)
            console.log(`Listening on ${apiHostname}`)
        })
}
