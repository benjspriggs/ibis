"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = require("./config");
var router = express_1.default.Router();
// if this 404s, make sure to build fomantic-ui
router.use("/semantic", express_1.default.static(config_1.paths.semantic, {
    index: false,
    immutable: true,
    maxAge: 1000000,
    lastModified: true,
    fallthrough: false
}));
router.use("/", express_1.default.static(config_1.paths.public, {
    index: false,
    immutable: true,
    maxAge: 10000,
    lastModified: true,
    fallthrough: false
}));
exports.default = router;

//# sourceMappingURL=assets.js.map
