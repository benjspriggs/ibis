"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./helpers");
var views_1 = __importDefault(require("./views"));
if (process.env["NODE_ENV"] === "production") {
    views_1.default.enable("view cache");
}
else {
    views_1.default.disable("view cache");
}
exports.default = views_1.default;
//# sourceMappingURL=app.js.map