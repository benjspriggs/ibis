import { exhbs } from "./helpers"
import express from "express"
import { Options } from "express-hbs"
import { fetchFromAPI } from "./helpers"
import { modalities } from "./common"
import cors from "cors"
import assets from "./assets"
import { requestLogger } from "./common"
import { join } from "path"
import { paths } from "./config"

const app = express()

const noSuchRoute = (params: any) => new Error(`no such route for: '${JSON.stringify(params)}'`)

app.use(cors())

app.use(requestLogger)

app.use("/assets/", assets)

const hbsConfig: Options = {
    "defaultLayout": join(paths.root, "views/layouts/default"),
    "extname": ".hbs",
    "layoutsDir": join(paths.root, "views/layouts"),
    "partialsDir": join(paths.root, "views/partials")
}

console.log("using", hbsConfig);

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
        fetchFromAPI(item.endpoint).then((response) => {
            if (response) {
                res.render(route, ({ ...item, data: response }))
            } else {
                res.render("error")
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

    fetchFromAPI(`${item.route}/${modality_code}`).then((response) => {
        if (response) {
            res.render("listing", {
                title: modalities[modality_code].displayName,
                needs_modalities: true,
                route: route,
                data: response.data
            })
        } else {
            res.render("error")
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

    fetchFromAPI(`${item.route}/${modality_code}/${resource}`).then((response) => {
        if (!response) {
            res.render("error")
            return
        }

        // TODO: add type safety to API routes
        const data = response.data
        res.render("single", {
            title: `${modalities[modality_code].displayName} - ${data.name}`,
            needs_modalities: true,
            route: route,
            data: data
        })
    })
})

export default app
