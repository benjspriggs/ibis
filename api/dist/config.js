import { applicationRoot } from "ibis-lib";
import { join } from "path";
export const port = parseInt(process.env.API_PORT, 10) || 3000;
export const hostname = process.env.API_HOSTNAME || "localhost";
export const apiHostname = `http://${hostname}:${port}`;
const ibisRoot = join(applicationRoot, "IBIS-Mac OS X");
const system = join(ibisRoot, "system");
const user = join(ibisRoot, "system");
const config = {
    paths: {
        ibisRoot,
        rx: join(system, "rx"),
        system,
        tx: join(system, "tx"),
        user,
    },
    relative: {
        applicationRoot: (...folders) => join(applicationRoot, ...folders),
        ibisRoot: (...folders) => join(ibisRoot, ...folders),
    },
};
export default config;
//# sourceMappingURL=config.js.map