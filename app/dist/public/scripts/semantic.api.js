"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-check
var config_1 = require("ibis-api/dist/config");
$.api.settings.verbose = true;
$.api.settings.api = {
    'search treatments': config_1.apiHostname + "/data/treatments?q={query}",
    'search diseases': config_1.apiHostname + "/data/diseases?q={query}&categorize=true",
    'search': config_1.apiHostname + "/data?q={query}"
};
//# sourceMappingURL=semantic.api.js.map