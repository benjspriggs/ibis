import start from "./index"
import fs from "fs"
import { applicationRoot } from "ibis-lib"

console.log(fs.readdirSync(applicationRoot))

start()
