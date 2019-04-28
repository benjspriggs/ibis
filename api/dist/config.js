"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ibis_lib_1 = require("ibis-lib");
var path_1 = require("path");
exports.port = parseInt(process.env.API_PORT, 10) || 3000;
exports.hostname = process.env.API_HOSTNAME || "localhost";
exports.apiHostname = "http://" + exports.hostname + ":" + exports.port;
var ibisRoot = path_1.join(ibis_lib_1.applicationRoot, "IBIS-Mac OS X");
var system = path_1.join(ibisRoot, "system");
var user = path_1.join(ibisRoot, "system");
var config = {
    paths: {
        ibisRoot: ibisRoot,
        rx: path_1.join(system, "rx"),
        system: system,
        tx: path_1.join(system, "tx"),
        user: user,
    },
    relative: {
        applicationRoot: function () {
            var folders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                folders[_i] = arguments[_i];
            }
            return path_1.join.apply(void 0, [ibis_lib_1.applicationRoot].concat(folders));
        },
        ibisRoot: function () {
            var folders = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                folders[_i] = arguments[_i];
            }
            return path_1.join.apply(void 0, [ibisRoot].concat(folders));
        },
    },
};
exports.default = config;
//# sourceMappingURL=config.js.map