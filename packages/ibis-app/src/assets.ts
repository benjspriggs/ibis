import { default as express } from "express"
import { paths } from "./config"

let router: express.Router = express.Router()

// if this 404s, make sure to build fomantic-ui
router.use("/semantic", express.static(paths.semantic, {
    index: false,
    immutable: true,
    maxAge: 1000000,
    lastModified: true,
    fallthrough: false
}))

router.use("/", express.static(paths.public, {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true,
    fallthrough: false,
    extensions: ["js"]
}))

export {
    router
}
