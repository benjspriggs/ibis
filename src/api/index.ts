import { apiHostname, hostname, port } from "./config"
import app, { initialize } from "./app"

app.listen(port, hostname, async () => {
    await initialize()
    console.log(`Listening on ${apiHostname}`)
})
