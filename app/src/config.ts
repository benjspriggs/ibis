import { isPackaged, applicationRoot } from "ibis-lib"
import { join } from "path"
import { readdir } from "fs"

function t(pre: string, path: string) {
    console.log('testing:', pre, path)
    readdir(path, (err, items) => {
        if (err) console.error(err)
        console.log(pre, "#", path, ":", items)
    })
}

const root = isPackaged() ? applicationRoot : join(applicationRoot, "app/dist/")
const views = join(root, "views")
const semantic = join(root, "semantic/dist")
const _public = join(root, "public")

t("root", root)
t("views", views)
t("semantic", semantic)
t("public", _public)

export const paths = {
    root,
    views,
    semantic,
    public: _public
}

export const port = parseInt(process.env["PORT"]) || 8080
export const hostname = process.env["HOSTNAME"] || "localhost"
export const appHostname = `http://${hostname}:${port}`
