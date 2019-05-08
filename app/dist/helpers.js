"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ibis_api_1 = require("ibis-api");
const axios_1 = __importDefault(require("axios"));
const express_hbs_1 = __importDefault(require("express-hbs"));
exports.exhbs = express_hbs_1.default;
const views_1 = require("./views");
const common_1 = require("./common");
const config_1 = require("./config");
const path_1 = require("path");
express_hbs_1.default.cwd = config_1.paths.root;
const menuLayoutPath = path_1.join(config_1.paths.views, "partials/menu");
exports.fetchFromAPI = (endpoint) => {
    const absolutePath = `${ibis_api_1.apiHostname}/${endpoint}`;
    return axios_1.default.get(absolutePath)
        .catch((err) => {
        console.error(`api err on endpoint ${endpoint}/'${err.request.path}': ${err.response}`);
    });
};
express_hbs_1.default.registerHelper("modalities", () => {
    return Object.keys(common_1.modalities).reduce((l, key) => l.concat(Object.assign({ code: key }, common_1.modalities[key])), []);
});
express_hbs_1.default.registerAsyncHelper("menu", (context, cb) => {
    const { data: { root: { destination } } } = context;
    express_hbs_1.default.cacheLayout(menuLayoutPath, true, (err, layouts) => {
        const [menuLayout] = layouts;
        const s = menuLayout({
            items: views_1.menuItems.map(item => (Object.assign({}, item, { style: item.destination === destination ? "active" : "", destination: item.external ? item.destination : `/${item.destination}` })))
        });
        cb(s);
    });
});
express_hbs_1.default.registerAsyncHelper("ibis_file", (info, cb) => {
    exports.fetchFromAPI(info.filepath.relative).then((data) => {
        cb(data);
    });
});
express_hbs_1.default.registerAsyncHelper("api", (context, cb) => {
    exports.fetchFromAPI(context.hash.endpoint).then((response) => {
        if (response) {
            cb(new express_hbs_1.default.SafeString(response.data));
        }
    });
});
express_hbs_1.default.registerHelper("hostname", (route) => {
    if (route === "api") {
        return ibis_api_1.apiHostname;
    }
});
express_hbs_1.default.registerHelper("json", (data) => {
    return JSON.stringify(data);
});
express_hbs_1.default.registerHelper("if_present", (value, defaultValue) => {
    return new express_hbs_1.default.SafeString(value || defaultValue);
});
const whitespace = /\s+/;
express_hbs_1.default.registerHelper("title_case", (s) => {
    if (typeof s !== "string")
        return s;
    return s
        .split(whitespace)
        .map(segment => segment.charAt(0).toLocaleUpperCase() + segment.slice(1))
        .join(" ");
});
express_hbs_1.default.registerHelper("with", (context, options) => {
    return options.fn(context);
});

//# sourceMappingURL=helpers.js.map
