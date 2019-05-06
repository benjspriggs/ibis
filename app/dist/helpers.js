"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ibis_api_1 = require("ibis-api");
var axios_1 = __importDefault(require("axios"));
var express_hbs_1 = __importDefault(require("express-hbs"));
exports.exhbs = express_hbs_1.default;
var views_1 = require("./views");
var common_1 = require("./common");
var config_1 = require("./config");
var path_1 = require("path");
express_hbs_1.default.cwd = config_1.paths.root;
var menuLayoutPath = path_1.join(config_1.paths.views, "partials/menu");
exports.fetchFromAPI = function (endpoint) {
    var absolutePath = ibis_api_1.apiHostname + "/" + endpoint;
    return axios_1.default.get(absolutePath)
        .catch(function (err) {
        console.error("api err on endpoint " + endpoint + "/'" + err.request.path + "': " + err.response);
    });
};
express_hbs_1.default.registerHelper("modalities", function () {
    return Object.keys(common_1.modalities).reduce(function (l, key) { return l.concat(__assign({ code: key }, common_1.modalities[key])); }, []);
});
express_hbs_1.default.registerAsyncHelper("menu", function (context, cb) {
    var destination = context.data.root.destination;
    express_hbs_1.default.cacheLayout(menuLayoutPath, true, function (err, layouts) {
        var menuLayout = layouts[0];
        var s = menuLayout({
            items: views_1.menuItems.map(function (item) { return (__assign({}, item, { style: item.destination === destination ? "active" : "", destination: item.external ? item.destination : "/" + item.destination })); })
        });
        cb(s);
    });
});
express_hbs_1.default.registerAsyncHelper("ibis_file", function (info, cb) {
    exports.fetchFromAPI(info.filepath.relative).then(function (data) {
        cb(data);
    });
});
express_hbs_1.default.registerAsyncHelper("api", function (context, cb) {
    exports.fetchFromAPI(context.hash.endpoint).then(function (response) {
        if (response) {
            cb(new express_hbs_1.default.SafeString(response.data));
        }
    });
});
express_hbs_1.default.registerHelper("hostname", function (route) {
    if (route === "api") {
        return ibis_api_1.apiHostname;
    }
});
express_hbs_1.default.registerHelper("json", function (data) {
    return JSON.stringify(data);
});
express_hbs_1.default.registerHelper("if_present", function (value, defaultValue) {
    return new express_hbs_1.default.SafeString(value || defaultValue);
});
var whitespace = /\s+/;
express_hbs_1.default.registerHelper("title_case", function (s) {
    if (typeof s !== "string")
        return s;
    return s
        .split(whitespace)
        .map(function (segment) { return segment.charAt(0).toLocaleUpperCase() + segment.slice(1); })
        .join(" ");
});
express_hbs_1.default.registerHelper("with", function (context, options) {
    return options.fn(context);
});

//# sourceMappingURL=helpers.js.map
