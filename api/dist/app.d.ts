import { initialize as dbInitialize } from "./db";
import { Application } from "express";
declare const app: Application;
export declare const initialize: typeof dbInitialize;
export default app;
