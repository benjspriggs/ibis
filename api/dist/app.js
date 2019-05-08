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
const db_1 = __importStar(require("./db"));
const ibis_lib_1 = require("ibis-lib");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const rx_1 = __importDefault(require("./rx"));
const tx_1 = __importDefault(require("./tx"));
const app = express_1.default();
exports.initialize = db_1.initialize;
app.use(cors_1.default());
app.use(ibis_lib_1.requestLogger);
app.get("/", (_, res) => {
    res.send("API");
});
app.get("/modalities", (_, res) => {
    res.send(ibis_lib_1.modalities);
});
app.use("/rx", rx_1.default);
app.use("/tx", tx_1.default);
app.use("/data", db_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map