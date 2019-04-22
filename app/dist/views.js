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
var helpers_1 = require("./helpers");
var express_1 = __importDefault(require("express"));
var helpers_2 = require("./helpers");
var common_1 = require("./common");
var cors_1 = __importDefault(require("cors"));
var assets_1 = __importDefault(require("./assets"));
var common_2 = require("./common");
var path_1 = require("path");
var config_1 = require("./config");
var app = express_1.default();
app.use(cors_1.default());
app.use(common_2.requestLogger);
app.use("/assets/", assets_1.default);
var hbsConfig = {
    "defaultLayout": path_1.join(config_1.paths.root, "views/layouts/default"),
    "extname": ".hbs",
    "layoutsDir": path_1.join(config_1.paths.root, "views/layouts"),
    "partialsDir": path_1.join(config_1.paths.root, "views/partials")
};
console.log("using", hbsConfig);
app.engine(".hbs", helpers_1.exhbs.express4(hbsConfig));
app.set("views", config_1.paths.views);
app.set("view engine", ".hbs");
exports.menuItems = [
    {
        destination: "",
        title: "Home"
    },
    {
        destination: "therapeutics",
        title: "Therapeutics",
        needs_modalities: true,
        route: "tx"
    },
    {
        destination: "materia-medica",
        title: "Materia Medica",
        needs_modalities: true,
        route: "rx"
    },
    {
        destination: "contact",
        title: "Contact"
    },
    {
        destination: "https://github.com/benjspriggs/ibis",
        title: "Source",
        external: true
    },
];
exports.getMenuItemBy = {
    destination: function (destination) { return exports.menuItems.find(function (item) { return item.destination === destination; }); },
    title: function (title) { return exports.menuItems.find(function (item) { return item.title === title; }); }
};
app.get("/", function (_, res) {
    res.render("home", exports.getMenuItemBy.destination(""));
});
app.use("/:asset", express_1.default.static(path_1.join(__dirname, "public")));
app.get("/:route", function (req, res, next) {
    var route = req.params.route;
    var item = exports.getMenuItemBy.destination(route);
    if (typeof item === "undefined") {
        next();
        return;
    }
    if (item.endpoint) {
        helpers_2.fetchFromAPI(item.endpoint).then(function (response) {
            if (response) {
                res.render(route, (__assign({}, item, { data: response })));
            }
            else {
                res.render("error");
            }
        });
    }
    else {
        res.render(route, item);
    }
});
app.get("/:route/:modality_code", function (req, res, next) {
    var _a = req.params, route = _a.route, modality_code = _a.modality_code;
    var item = exports.getMenuItemBy.destination(route);
    if (!item) {
        return next(new Error("no such route" + route));
    }
    helpers_2.fetchFromAPI(item.route + "/" + modality_code).then(function (response) {
        if (response) {
            res.render("listing", {
                title: common_1.modalities[modality_code].displayName,
                needs_modalities: true,
                route: route,
                data: response.data
            });
        }
        else {
            res.render("error");
        }
    });
});
app.get("/:route/:modality_code/:resource", function (req, res, next) {
    var _a = req.params, route = _a.route, modality_code = _a.modality_code, resource = _a.resource;
    if (!route || !modality_code || !resource) {
        return next();
    }
    var item = exports.getMenuItemBy.destination(route);
    if (!item) {
        return next(new Error("no such route" + route));
    }
    helpers_2.fetchFromAPI(item.route + "/" + modality_code + "/" + resource).then(function (response) {
        if (!response) {
            res.render("error");
            return;
        }
        // TODO: add type safety to API routes
        var data = response.data;
        res.render("single", {
            title: common_1.modalities[modality_code].displayName + " - " + data.name,
            needs_modalities: true,
            route: route,
            data: data
        });
    });
});
exports.default = app;
//# sourceMappingURL=views.js.map