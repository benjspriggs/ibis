import { applicationRoot } from "ibis-lib"
import { config } from "ibis-api"
import express from "express"
import path from "path"

let router: express.Router = express.Router()

router.get("/favicon.ico", (_, res) => {
    res.sendFile(config.relative.ibisRoot("system", "rsrcs", "32IBIS3.ico"))
})

const semanticPath = path.join(applicationRoot, "app", "semantic", "dist")
console.log('serving semantic from ', semanticPath)
// if this 404s, make sure to build fomantic-ui
router.use("/semantic", express.static(semanticPath, {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true,
    fallthrough: false
}))

const publicPath = path.join(applicationRoot, "app", "dist", "public")
console.log('serving public from: ', publicPath)
router.use("/", express.static(publicPath, {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true,
    fallthrough: false
}))

export default router
