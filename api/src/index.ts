import { apiHostname, hostname, port } from "./config"
import app, { initialize } from "./app"

export { port, hostname, apiHostname, default as config } from "./config"
export { SearchResult, CategorizedSearchMap, CategorizedSearchResult } from "./db"

export default () => {
    app.listen(port, hostname, async () => {
        await initialize()
        console.log(`Listening on ${apiHostname}`)
    })
}
