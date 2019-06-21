import { dirname, join } from "path";

export interface pkgOptions {
    entrypoint?: string;
    defaultEntrypoint?: string;
}

export function applicationRoot() {
    const pkg: pkgOptions = (process as any).pkg
    if (!!pkg) {
        // https://www.npmjs.com/package/pkg#snapshot-filesystem
        return dirname(pkg.entrypoint);
    } else {
        return join(__dirname, '../..')
    }
}
