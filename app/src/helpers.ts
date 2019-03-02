import { apiHostname } from "ibis-api"
import axios from "axios"
import exhbs from "express-hbs"
import fs from "fs"
import { menuItems } from "./views"
import { modalities } from "./common"
import path from "path"

const menuLayoutPath = "views/partials/menu"

const readFile = (root: string) => (filename: string, cb: Function) => {
    fs.readFile(path.join(root, filename), "utf8", function (err, content) {
        if (err) {
            console.error(err)
            cb()
        } else {
            cb(new exhbs.SafeString(content))
        }
    });
}

export const fetchFromAPI = (endpoint: string) => {
    const absolutePath = `${apiHostname}/${endpoint}`
    return axios.get(absolutePath)
        .catch((err) => {
            console.error(`api err on endpoint ${endpoint}/'${err.request.path}': ${err.response}`)
        })
};

exhbs.registerHelper("modalities", (options: any) => {
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
})

exhbs.registerAsyncHelper("api", (context: any, cb: Function) => {
    fetchFromAPI(context.hash.endpoint).then((response) =>  {
        if (response) {
            cb(new exhbs.SafeString(response.data))
        }
    })
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
