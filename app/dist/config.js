"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ibis_lib_1 = require("ibis-lib");
var path_1 = require("path");
var root = ibis_lib_1.isPackaged() ? ibis_lib_1.applicationRoot : path_1.join(ibis_lib_1.applicationRoot, "app/dist/");
var views = path_1.join(root, "views");
var semantic = path_1.join(root, "semantic/dist");
var _public = path_1.join(root, "public");
exports.paths = {
    root: root,
    views: views,
    semantic: semantic,
    public: _public
};
exports.port = parseInt(process.env["PORT"]) || 8080;
exports.hostname = process.env["HOSTNAME"] || "localhost";
exports.appHostname = "http://" + exports.hostname + ":" + exports.port;
//# sourceMappingURL=config.js.map