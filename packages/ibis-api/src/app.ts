import { initialize as dbInitialize } from "./db"
import { router as search } from "./search"
import { modalities, requestLogger } from "ibis-lib"

import { default as cors } from "cors"
import { default as express, Application }  from "express"
import { router as entry } from "./file"

const app: Application = express()

export const initialize = dbInitialize

app.use(cors())

app.use(requestLogger)

app.get("/modalities", (_, res: express.Response) => {
    res.send(modalities)
})

app.use("/data", search)

app.use("/", entry)

export {
    app
}
