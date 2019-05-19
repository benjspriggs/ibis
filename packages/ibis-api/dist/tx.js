"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ibis_lib_1 = require("ibis-lib");
const config_1 = __importDefault(require("./config"));
const express_1 = __importDefault(require("express"));
const file_1 = __importDefault(require("./file"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const router = express_1.default.Router();
const allInfo = async () => {
    const items = fs_1.default.readdirSync(config_1.default.paths.tx);
    const dirs = items.filter(item => fs_1.default.statSync(path_1.join(config_1.default.paths.tx, item)).isDirectory());
    const listing = await Promise.all(dirs.map(async (dir) => {
        const items = await new Promise(async (resolve, reject) => {
            fs_1.default.readdir(path_1.join(config_1.default.paths.tx, dir), async (err, items) => {
                if (err)
                    return reject(err);
                resolve(items);
            });
        });
        const infos = items.map((item) => ibis_lib_1.parseHeaderFromFile(path_1.join(config_1.default.paths.tx, dir, item)));
        return ({
            modality: dir,
            treatments: await Promise.all(infos)
        });
    }));
    return listing;
};
router.get("/treatments", (_, res) => {
    allInfo().then((treatmentListing) => {
        res.send([].concat(...treatmentListing.map(t => t.treatments)));
    });
});
router.use("/", file_1.default({
    endpoint: "tx",
    absoluteFilePath: config_1.default.relative.ibisRoot("system", "tx")
}));
exports.default = router;
