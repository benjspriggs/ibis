import db, { initialize as dbInitialize } from "./db"
import { modalities, requestLogger } from "ibis-lib"

import cors from "cors"
import { default as express, Application }  from "express"
import rx from "./rx"
import tx from "./tx"

const app: Application = express()

export const initialize = dbInitialize

app.use(cors())

app.use(requestLogger)

app.get("/", (_, res: express.Response) => {
    res.send("API")
})

app.get("/modalities", (_, res: express.Response) => {
    res.send(modalities)
})

app.use("/rx", rx)
app.use("/tx", tx)

app.use("/data", db)

export default app
