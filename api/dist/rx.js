"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
const file_1 = __importDefault(require("./file"));
const router = express_1.default.Router();
router.use("/", file_1.default({
    endpoint: "rx",
    absoluteFilePath: config_1.default.relative.ibisRoot("system", "rx"),
}));
exports.default = router;
//# sourceMappingURL=rx.js.map