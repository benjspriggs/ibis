"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var config_2 = require("./config");
exports.port = config_2.port;
exports.hostname = config_2.hostname;
exports.apiHostname = config_2.apiHostname;
exports.config = config_2.default;
exports.default = () => {
    app_1.default.listen(config_1.port, config_1.hostname, () => __awaiter(this, void 0, void 0, function* () {
        yield app_1.initialize();
        console.log(`Listening on ${config_1.apiHostname}`);
    }));
};
//# sourceMappingURL=index.js.map