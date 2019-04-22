"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = __importStar(require("./db"));
var ibis_lib_1 = require("ibis-lib");
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var rx_1 = __importDefault(require("./rx"));
var tx_1 = __importDefault(require("./tx"));
var app = express_1.default();
exports.initialize = db_1.initialize;
app.use(cors_1.default());
app.use(ibis_lib_1.requestLogger);
app.get("/", function (_, res) {
    res.send("API");
});
app.get("/modalities", function (_, res) {
    res.send(ibis_lib_1.modalities);
});
app.use("/rx", rx_1.default);
app.use("/tx", tx_1.default);
app.use("/data", db_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map