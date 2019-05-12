import { applicationRoot } from "ibis-lib"
import { join } from "path"

export const port: number = parseInt(process.env.API_PORT, 10) || 3000
export const hostname: string = process.env.API_HOSTNAME || "localhost"
export const apiHostname: string = `http://${hostname}:${port}`

const ibisRoot: string = join(applicationRoot.live, "IBIS-Mac OS X")
const system: string = join(ibisRoot, "system")
const user: string = join(ibisRoot, "system")

interface IConfig {
    paths: {
        ibisRoot: string,
        system: string,
        user: string,
        rx: string,
        tx: string,
    },
    relative: {
        ibisRoot: (...folders: string[]) => string,
    }
}

const config: IConfig = {
    paths: {
        ibisRoot,
        rx: join(system, "rx"),
        system,
        tx: join(system, "tx"),
        user,
    },
    relative: {
        ibisRoot: (...folders: string[]) => join(ibisRoot, ...folders),
    },
}

export default config
