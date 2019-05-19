"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const express_1 = __importDefault(require("express"));
const helpers_2 = require("./helpers");
const cors_1 = __importDefault(require("cors"));
const assets_1 = __importDefault(require("./assets"));
const common_1 = require("./common");
const path_1 = require("path");
const config_1 = require("./config");
const ibis_lib_1 = require("ibis-lib");
const app = express_1.default();
const noSuchRoute = (params) => new Error(`no such route for: '${JSON.stringify(params)}'`);
app.use(cors_1.default());
app.use(common_1.requestLogger);
app.use("/assets", assets_1.default);
const hbsConfig = {
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
        destination: "home",
        title: "Home",
        route: "/"
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
        destination: "https://github.com/benjspriggs/ibis",
        title: "Source",
        external: true
    },
];
exports.getMenuItemBy = {
    destination: (destination) => exports.menuItems.find(item => item.destination === destination),
    title: (title) => exports.menuItems.find(item => item.title === title)
};
app.get("/", (_, res) => {
    res.render("therapeutics", exports.getMenuItemBy.destination(""));
});
app.use("/:asset", express_1.default.static(path_1.join(__dirname, "public")));
app.get("/:route", (req, res, next) => {
    const { route } = req.params;
    const item = exports.getMenuItemBy.destination(route);
    if (typeof item === "undefined") {
        next();
        return;
    }
    if (item.endpoint) {
        helpers_2.fetchFromAPI(item.endpoint).then((data) => {
            if (data) {
                res.render(route, (Object.assign({}, item, { data: data })));
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
app.get("/:route/:modality_code", (req, res, next) => {
    const { route, modality_code } = req.params;
    const item = exports.getMenuItemBy.destination(route);
    if (!item) {
        return next(noSuchRoute(req.params));
    }
    const modality = ibis_lib_1.getModality(modality_code);
    if (!modality) {
        return next(noSuchRoute(modality_code));
    }
    helpers_2.fetchFromAPI(`${item.route}/${modality_code}`).then((data) => {
        if (data) {
            res.render("listing", Object.assign({}, item, { title: modality.data.displayName, needs_modalities: true, route: route, data: data }));
        }
        else {
            res.render("error");
        }
    });
});
app.get("/:route/:modality_code/:resource", (req, res, next) => {
    const { route, modality_code, resource } = req.params;
    if (!route || !modality_code || !resource) {
        return next();
    }
    const item = exports.getMenuItemBy.destination(route);
    if (!item) {
        return next(noSuchRoute(req.params));
    }
    const modality = ibis_lib_1.getModality(modality_code);
    if (!modality) {
        return next(noSuchRoute(modality_code));
    }
    helpers_2.fetchFromAPI(`${item.route}/${modality_code}/${resource}`).then((data) => {
        if (!data) {
            res.render("error");
            return;
        }
        // TODO: add type safety to API routes
        res.render("single", Object.assign({}, item, { title: `${modality.data.displayName} - ${data.name}`, needs_modalities: true, route: route, data: data }));
    });
});
exports.default = app;

//# sourceMappingURL=views.js.map
