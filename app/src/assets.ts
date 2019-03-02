import { config } from "ibis-api"
import express from "express"
import path from "path"

let router: express.Router = express.Router()

router.get("/favicon.ico", (_, res) => {
    res.sendFile(config.relative.ibisRoot("system", "rsrcs", "32IBIS3.ico"))
})

// if this 404s, make sure to build fomantic-ui
router.use("/semantic", express.static(path.join(config.paths.applicationRoot, "semantic", "dist"), {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true
}))

router.use("/", express.static(path.join(config.paths.applicationRoot, "dist", "public"), {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true
}))

export default router
