import db, { initialize as dbInitialize } from "./db"
import { modalities, requestLogger } from "../common"

import cors from "cors"
import express from "express"
import rx from "./rx"
import tx from "./tx"

const app = express()

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
