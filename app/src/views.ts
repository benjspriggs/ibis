import express from "express"
import { fetchFromAPI } from "./helpers"
import { modalities } from "./common"
import path from "path"

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

var router: express.Router = express.Router()

router.get("/", (_, res: express.Response) => {
    res.render("home", getMenuItemBy.destination(""))
})

router.use("/:asset", express.static(path.join(__dirname, "public")))

router.get("/:route", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {
        route
    } = req.params

    const item = getMenuItemBy.destination(route)

    if (typeof item === "undefined") {
        next(new Error(`no such route found: ${route}`))
        return
    }

    if (item.endpoint) {
        fetchFromAPI(item.endpoint).then((response) => {
            if (response) {
                res.render(route, ({ ...item, data: response }))
            } else {
                res.render('error')
            }
        })
    } else {
        res.render(route, item)
    }
})

router.get("/:route/:modality_code", (req, res, next) => {
    const {
        route,
        modality_code
    } = req.params

    const item = getMenuItemBy.destination(route)

    if (!item) {
        return next(new Error("no such route" + route))
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
            res.render('error')
        }
    })
})

router.get("/:route/:modality_code/:resource", (req, res, next) => {
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
        return next(new Error("no such route" + route))
    }

    fetchFromAPI(`${item.route}/${modality_code}/${resource}`).then((response) => {
        if (!response) {
            res.render('error')
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

export default router