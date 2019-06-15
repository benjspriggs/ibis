// @ts-check
import tests from "./common"
import { join } from "path"

tests({
    command: "node", 
    args: [join(__dirname, "..", "start.js")],
    prefix: "app (js)"
})
