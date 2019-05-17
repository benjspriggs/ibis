"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ibis_lib_1 = require("ibis-lib");
const path_1 = require("path");
const root = ibis_lib_1.isPackaged() ? ibis_lib_1.applicationRoot.packaged : path_1.join(ibis_lib_1.applicationRoot.packaged, "app/dist/");
const views = path_1.join(root, "views");
const semantic = path_1.join(root, "semantic/dist");
const _public = path_1.join(root, "public");
exports.paths = {
    root,
    views,
    semantic,
    public: _public
};
exports.port = parseInt(process.env["PORT"]) || 8080;
exports.hostname = process.env["HOSTNAME"] || "127.0.0.1";
exports.appHostname = `${exports.hostname}:${exports.port}`;

//# sourceMappingURL=config.js.map
