"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("./config"));
var express_1 = __importDefault(require("express"));
var file_1 = __importDefault(require("./file"));
var router = express_1.default.Router();
router.use("/", file_1.default({
    endpoint: "rx",
    absoluteFilePath: config_1.default.relative.ibisRoot("system", "rx"),
}));
exports.default = router;
//# sourceMappingURL=rx.js.map