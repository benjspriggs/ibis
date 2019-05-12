"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const common_1 = require("./common");
ava_1.default("common:getModality", (t) => {
    const acup = "acup";
    t.not(common_1.getModality(acup), undefined);
    t.is(common_1.getModality(acup).data.displayName, common_1.modalities[acup].displayName);
});

//# sourceMappingURL=common.test.js.map
