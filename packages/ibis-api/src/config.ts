import { isHttpsEnabled } from "ibis-lib"
import { join } from "path"

export const port: number = parseInt(process.env.API_PORT, 10) || 3000
export const hostname: string = process.env.API_HOSTNAME || "127.0.0.1"
export const apiHostname: string = `${isHttpsEnabled() ? "https" : "http"}://${hostname}:${port}`

const ibisRoot: string = join(process.cwd(), "IBIS-Mac OS X")
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
