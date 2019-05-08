var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parseHeaderFromFile } from "ibis-lib";
import config from "./config";
import express from "express";
import file from "./file";
import fs from "fs";
import { join } from "path";
const router = express.Router();
const allInfo = () => __awaiter(this, void 0, void 0, function* () {
    const items = fs.readdirSync(config.paths.tx);
    const dirs = items.filter(item => fs.statSync(join(config.paths.tx, item)).isDirectory());
    const listing = yield Promise.all(dirs.map((dir) => __awaiter(this, void 0, void 0, function* () {
        const items = yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            fs.readdir(join(config.paths.tx, dir), (err, items) => __awaiter(this, void 0, void 0, function* () {
                if (err)
                    return reject(err);
                resolve(items);
            }));
        }));
        const infos = items.map((item) => parseHeaderFromFile(join(config.paths.tx, dir, item)));
        return ({
            modality: dir,
            treatments: yield Promise.all(infos)
        });
    })));
    return listing;
});
router.get("/treatments", (_, res) => {
    allInfo().then((treatmentListing) => {
        res.send([].concat(...treatmentListing.map(t => t.treatments)));
    });
});
router.use("/", file({
    endpoint: "tx",
    absoluteFilePath: config.relative.ibisRoot("system", "tx")
}));
export default router;
//# sourceMappingURL=tx.js.map