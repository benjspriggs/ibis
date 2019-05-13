"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ibis_lib_1 = require("ibis-lib");
const path_1 = require("path");
exports.port = parseInt(process.env.API_PORT, 10) || 3000;
exports.hostname = process.env.API_HOSTNAME || "127.0.0.1";
exports.apiHostname = `https://${exports.hostname}:${exports.port}`;
const ibisRoot = path_1.join(ibis_lib_1.applicationRoot.live, "IBIS-Mac OS X");
const system = path_1.join(ibisRoot, "system");
const user = path_1.join(ibisRoot, "system");
const config = {
    paths: {
        ibisRoot,
        rx: path_1.join(system, "rx"),
        system,
        tx: path_1.join(system, "tx"),
        user,
    },
    relative: {
        ibisRoot: (...folders) => path_1.join(ibisRoot, ...folders),
    },
};
exports.default = config;
