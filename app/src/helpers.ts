import { apiHostname } from "ibis-api"
import exhbs from "express-hbs"
import fetch from "node-fetch"
import { menuItems } from "./views"
import { modalities } from "./common"
import { paths } from "./config"
import { join } from "path"

exhbs.cwd = paths.root

export { exhbs }

const menuLayoutPath = join(paths.views, "partials/menu")

export const fetchFromAPI = (endpoint: string) => {
    const absolutePath = `${apiHostname}/${endpoint}`
    return fetch(absolutePath, {
        method: 'GET',
        compress: true
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    }, err => {
        console.error(`api err on endpoint ${endpoint}: ${err.toString()}`)
        throw err;
    });
};

exhbs.registerHelper("modalities", () => {
    return Object.keys(modalities).reduce((l, key) => l.concat({ code: key, ...modalities[key]}), [])
})

exhbs.registerAsyncHelper("menu", (context: any, cb: Function) => {
    const {
        data: {
            root: {
                destination
            }
        }
    } = context

    exhbs.cacheLayout(menuLayoutPath, true, (err: any, layouts: any[]) => {
        const [
            menuLayout
        ] = layouts;

        const s = menuLayout({
            items: menuItems.map(item => ({
                ...item,
                style: item.destination === destination ? "active": "",
                destination: item.external ? item.destination : `/${item.destination}`
            }))
        })

        cb(s)
    });
})

exhbs.registerAsyncHelper("ibis_file", (info: any, cb: Function) => {
    fetchFromAPI(info.filepath.relative).then((data) => {
        cb(data)
    })
    .catch(() => cb())
})

exhbs.registerAsyncHelper("api", (context: any, cb: Function) => {
    fetchFromAPI(context.hash.endpoint).then((response) =>  {
        if (response) {
            cb(new exhbs.SafeString(response.data))
        }
    })
    .catch(() => cb())
})

exhbs.registerHelper("hostname", (route: any) => {
    if (route === "api") {
        return apiHostname;
    }
})

exhbs.registerHelper("json", (data: any) => {
    return JSON.stringify(data)
})

exhbs.registerHelper("if_present", (value: any, defaultValue: any) => {
    return new exhbs.SafeString(value || defaultValue)
})

const whitespace = /\s+/

exhbs.registerHelper("title_case", (s: string) => {
    if (typeof s !== "string") return s;

    return s
        .split(whitespace)
        .map(segment => segment.charAt(0).toLocaleUpperCase() + segment.slice(1))
        .join(" ")
})

exhbs.registerHelper("with", (context: any, options: any) => {
    return options.fn(context)
})
