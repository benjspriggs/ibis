"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const ibis_lib_1 = require("ibis-lib");
const app_1 = __importDefault(require("./app"));
ibis_lib_1.createServer(app_1.default)
    .then(server => {
    console.log(`Listening on ${config_1.appHostname}`);
    server.listen(config_1.port, config_1.hostname);
});

//# sourceMappingURL=index.js.map
