import { applicationRoot } from "ibis-lib"
import path from "path"

export const port: number = parseInt(process.env.API_PORT, 10) || 3000
export const hostname: string = process.env.API_HOSTNAME || "localhost"
export const apiHostname: string = `http://${hostname}:${port}`

const ibisRoot: string = path.join(applicationRoot, "IBIS-Mac OS X")
const system: string = path.join(ibisRoot, "system")
const user: string = path.join(ibisRoot, "system")

interface IConfig {
    paths: {
        ibisRoot: string,
        system: string,
        user: string,
        rx: string,
        tx: string,
    },
    relative: {
        applicationRoot: (...folders: string[]) => string,
        ibisRoot: (...folders: string[]) => string,
    }
}

const config: IConfig = {
    paths: {
        ibisRoot,
        rx: path.join(system, "rx"),
        system,
        tx: path.join(system, "tx"),
        user,
    },
    relative: {
        applicationRoot: (...folders: string[]) => path.join(applicationRoot, ...folders),
        ibisRoot: (...folders: string[]) => path.join(ibisRoot, ...folders),
    },
}

export default config
