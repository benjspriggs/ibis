"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var app_1 = __importDefault(require("./app"));
app_1.default.listen(config_1.port, config_1.hostname, function () {
    console.log("Listening on " + config_1.appHostname);
});
//# sourceMappingURL=index.js.map