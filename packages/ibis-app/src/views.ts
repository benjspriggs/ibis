import { exhbs } from "./helpers"
import { default as express, Application } from "express"
import { Options } from "express-hbs"
import { fetchFromAPI } from "./helpers"
import { requestLogger } from "ibis-lib"
import { default as cors } from "cors"
import { router as assets } from "./assets"
import { join } from "path"
import { paths } from "./config"
import { getModality } from "ibis-lib";

const app: Application = express()

const noSuchRoute = (params: any) => new Error(`no such route for: '${JSON.stringify(params)}'`)

app.use(cors())

app.use(requestLogger)

app.use("/assets", assets)

const hbsConfig: Options = {
    "defaultLayout": join(paths.root, "views/layouts/default"),
    "extname": ".hbs",
    "layoutsDir": join(paths.root, "views/layouts"),
    "partialsDir": join(paths.root, "views/partials")
}

/*
const debug = (obj: any) => {
    for (var path in obj) {
        const p = obj[path];

        try {
            console.log(p, readdirSync(p))
        } catch (e) {
            console.error(p, e)
        }
    }
}

console.log("using", {
    hbsConfig,
    paths
}, debug(hbsConfig), debug(paths));
*/

app.engine(".hbs", exhbs.express4(hbsConfig))

app.set("views", paths.views)

app.set("view engine", ".hbs")

export const menuItems: {
    destination: string,
    title: string,
    external?: boolean,
    endpoint?: string,
    needs_modalities?: boolean,
    route?: string
}[] = [
        {
            destination: "",
            title: "Home",
        },
        {
            destination: "treatments",
            title: "Therapeutics",
            needs_modalities: true,
            route: "treatments"
        },
        {
            destination: "monographs",
            title: "Monographs",
            needs_modalities: true,
            route: "monographs"
        },
        {
            destination: "https://github.com/benjspriggs/ibis",
            title: "Source",
            external: true
        },
    ]

export const getMenuItemBy = {
    destination: (destination: string) => menuItems.find(item => item.destination === destination),
    title: (title: string) => menuItems.find(item => item.title === title)
}

app.get("/", (_, res: express.Response) => {
    res.render("home", getMenuItemBy.destination(""))
})

app.use("/:asset", express.static(join(__dirname, "public")))

app.get("/:route", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        route
    } = req.params

    const item = getMenuItemBy.destination(route)

    if (typeof item === "undefined") {
        next()
        return
    }

    if (item.endpoint) {
        fetchFromAPI(item.endpoint).then((data) => {
            if (data) {
                res.render(route, ({ ...item, data: data }))
            } else {
                res.render("error", {
                    route: route,
                    view: route,
                    message: "no data returned from api",
                    endpoint: item.endpoint
                })
            }
        })
    } else {
        res.render(route, item)
    }
})

app.get("/:route/:modality_code", (req, res, next) => {
    const {
        route,
        modality_code
    } = req.params

    const item = getMenuItemBy.destination(route)

    if (!item) {
        return next(noSuchRoute(req.params))
    }

    const modality = getModality(modality_code)

    if (!modality) {
        return next(noSuchRoute(modality_code))
    }

    fetchFromAPI(`${item.route}/${modality_code}`).then((data) => {
        if (data) {
            res.render("listing", {
                ...item,
                title: modality.data.displayName,
                needs_modalities: true,
                route: route,
                data: data
            })
        } else {
            res.render("error", {
                "message": "no data returned from API",
                view: "listing",
                route: item.route,
                modality: modality_code
            })
        }
    })
})

app.get("/:route/:modality_code/:resource", (req, res, next) => {
    const {
        route,
        modality_code,
        resource
    } = req.params;

    if (!route || !modality_code || !resource) {
        return next()
    }

    const item = getMenuItemBy.destination(route)

    if (!item) {
        return next(noSuchRoute(req.params))
    }

    const modality = getModality(modality_code)

    if (!modality) {
        return next(noSuchRoute(modality_code))
    }

    fetchFromAPI(`${item.route}/${modality_code}/${resource}`).then((data) => {
        if (!data) {
            res.render("error", {
                "message": "no data returned from API",
                view: "single",
                route: item.route,
                modality_code,
                resource
            })
            return
        }

        res.render("single", {
            ...item,
            title: `${modality.data.displayName} - ${data.header.name}`,
            needs_modalities: true,
            route: route,
            data: data
        })
    })
})

export {
    app
}
