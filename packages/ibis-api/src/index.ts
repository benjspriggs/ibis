import { apiHostname, hostname, port } from "./config"
import { app, initialize } from "./app"
import { h2 } from "ibis-lib"

export { port, hostname, apiHostname, default as config } from "./config"
export { SearchResult, CategorizedSearchMap, CategorizedSearchResult } from "./search"

export const start = () => {
    h2(app)
        .then(async server => {
            await initialize()
            server.listen(port, hostname, () => {
                console.log(`Listening on ${apiHostname}`)
                process.send && process.send("initialized")
            })
        })
}
