import { Header, parseHeaderFromFile } from "ibis-lib"

import { config } from "./config"
import { default as express, Router } from "express"
import { router as file } from "./file"
import fs from "fs"
import { join } from "path"

const router: Router = express.Router()

interface TreatmentListing {
    modality: string,
    treatments: Header[]
}

const allInfo: () => Promise<TreatmentListing[]> = async () => {
    const items: string[] = fs.readdirSync(config.paths.tx)

    const dirs = items.filter(item => fs.statSync(join(config.paths.tx, item)).isDirectory())

    const listing = await Promise.all(dirs.map(async dir => {
        const items = await new Promise<string[]>(async (resolve, reject) => {
            fs.readdir(join(config.paths.tx, dir), async (err: any, items: string[]) => {
                if (err)
                    return reject(err);
                resolve(items);
            });
        });
        const infos = items.map((item: string) => parseHeaderFromFile(join(config.paths.tx, dir, item)));

        return ({
            modality: dir,
            treatments: await Promise.all(infos)
        });
    }))

    return listing
}

router.get("/treatments", (_, res: express.Response) => {
    allInfo().then((treatmentListing) => {
        res.send([].concat(...treatmentListing.map(t => t.treatments)))
    })
})

router.use("/", file({
    endpoint: "tx",
    absoluteFilePath: config.relative.ibisRoot("system", "tx")
}))

export { 
    router
}
