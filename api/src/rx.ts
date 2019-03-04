import config from "./config"
import express from "express"
import file from "./file"

const router = express.Router()

router.use("/", file({
    endpoint: "rx",
    absoluteFilePath: config.relative.ibisRoot("system", "rx"),
    // trimLeftPattern: /[Dd]efinition/
}))

export default router
