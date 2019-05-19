import config from "./config"
import { default as express, Router } from "express"
import file from "./file"

const router: Router = express.Router()

router.use("/", file({
    endpoint: "rx",
    absoluteFilePath: config.relative.ibisRoot("system", "rx"),
    // trimLeftPattern: /[Dd]efinition/
}))

export default router
