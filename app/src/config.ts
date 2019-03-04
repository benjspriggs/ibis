import { isPackaged, applicationRoot } from "ibis-lib"
import { join } from "path"
import { readdir } from "fs"

const root = isPackaged() ? applicationRoot : join(applicationRoot, "app/dist/")
const views = join(root, "views")
const semantic = join(root, "semantic/dist")
const _public = join(root, "public")

export const paths = {
    root,
    views,
    semantic,
    public: _public
}

export const port = parseInt(process.env["PORT"]) || 8080
export const hostname = process.env["HOSTNAME"] || "localhost"
export const appHostname = `http://${hostname}:${port}`
