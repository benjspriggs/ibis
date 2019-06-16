import { applicationRoot, isHttpsEnabled } from "ibis-lib"
import { join } from "path"

const root = applicationRoot()
const views = join(root, "views")
const semantic = join(root, "semantic/dist")
const _public = join(root, "public")

export const paths = {
    root,
    views,
    semantic,
    public: _public
}

export const port = parseInt(process.env["APP_PORT"]) || 8080
export const hostname = process.env["APP_HOSTNAME"] || "127.0.0.1"
export const appHostname = `${isHttpsEnabled() ? "https" : "http"}://${hostname}:${port}`
