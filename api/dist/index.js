"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const app_1 = __importStar(require("./app"));
const ibis_lib_1 = require("ibis-lib");
var config_2 = require("./config");
exports.port = config_2.port;
exports.hostname = config_2.hostname;
exports.apiHostname = config_2.apiHostname;
exports.config = config_2.default;
exports.default = () => {
    ibis_lib_1.createServer(app_1.default)
        .then(async (server) => {
        await app_1.initialize();
        server.listen(config_1.port, config_1.hostname);
        console.log(`Listening on ${config_1.apiHostname}`);
    });
};
