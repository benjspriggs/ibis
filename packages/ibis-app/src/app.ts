import "./helpers"

import app from "./views"

if (process.env["NODE_ENV"] === "production") {
    app.enable("view cache")
} else {
    app.disable("view cache")
}

export default app
