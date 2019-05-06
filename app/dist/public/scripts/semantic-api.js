(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ibis-api/dist/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //@ts-check
    const config_1 = require("ibis-api/dist/config");
    $.api.settings.verbose = true;
    $.api.settings.api = {
        'search treatments': `${config_1.apiHostname}/data/treatments?q={query}`,
        'search diseases': `${config_1.apiHostname}/data/diseases?q={query}&categorize=true`,
        'search': `${config_1.apiHostname}/data?q={query}`
    };
});

//# sourceMappingURL=semantic-api.js.map
