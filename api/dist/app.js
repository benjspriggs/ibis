import db, { initialize as dbInitialize } from "./db";
import { modalities, requestLogger } from "ibis-lib";
import cors from "cors";
import express from "express";
import rx from "./rx";
import tx from "./tx";
const app = express();
export const initialize = dbInitialize;
app.use(cors());
app.use(requestLogger);
app.get("/", (_, res) => {
    res.send("API");
});
app.get("/modalities", (_, res) => {
    res.send(modalities);
});
app.use("/rx", rx);
app.use("/tx", tx);
app.use("/data", db);
export default app;
//# sourceMappingURL=app.js.map