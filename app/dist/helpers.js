import { apiHostname } from "ibis-api";
import axios from "axios";
import exhbs from "express-hbs";
import { menuItems } from "./views";
import { modalities } from "./common";
import { paths } from "./config";
import { join } from "path";
exhbs.cwd = paths.root;
export { exhbs };
const menuLayoutPath = join(paths.views, "partials/menu");
export const fetchFromAPI = (endpoint) => {
    const absolutePath = `${apiHostname}/${endpoint}`;
    return axios.get(absolutePath)
        .catch((err) => {
        console.error(`api err on endpoint ${endpoint}/'${err.request.path}': ${err.response}`);
    });
};
exhbs.registerHelper("modalities", () => {
    return Object.keys(modalities).reduce((l, key) => l.concat(Object.assign({ code: key }, modalities[key])), []);
});
exhbs.registerAsyncHelper("menu", (context, cb) => {
    const { data: { root: { destination } } } = context;
    exhbs.cacheLayout(menuLayoutPath, true, (err, layouts) => {
        const [menuLayout] = layouts;
        const s = menuLayout({
            items: menuItems.map(item => (Object.assign({}, item, { style: item.destination === destination ? "active" : "", destination: item.external ? item.destination : `/${item.destination}` })))
        });
        cb(s);
    });
});
exhbs.registerAsyncHelper("ibis_file", (info, cb) => {
    fetchFromAPI(info.filepath.relative).then((data) => {
        cb(data);
    });
});
exhbs.registerAsyncHelper("api", (context, cb) => {
    fetchFromAPI(context.hash.endpoint).then((response) => {
        if (response) {
            cb(new exhbs.SafeString(response.data));
        }
    });
});
exhbs.registerHelper("hostname", (route) => {
    if (route === "api") {
        return apiHostname;
    }
});
exhbs.registerHelper("json", (data) => {
    return JSON.stringify(data);
});
exhbs.registerHelper("if_present", (value, defaultValue) => {
    return new exhbs.SafeString(value || defaultValue);
});
const whitespace = /\s+/;
exhbs.registerHelper("title_case", (s) => {
    if (typeof s !== "string")
        return s;
    return s
        .split(whitespace)
        .map(segment => segment.charAt(0).toLocaleUpperCase() + segment.slice(1))
        .join(" ");
});
exhbs.registerHelper("with", (context, options) => {
    return options.fn(context);
});

//# sourceMappingURL=helpers.js.map
