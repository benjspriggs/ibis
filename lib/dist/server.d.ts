/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
export interface ServerOptions {
    key?: string;
    cert?: string;
}
export declare const h2: (app: (request: IncomingMessage, response: ServerResponse) => void) => Promise<import("https").Server>;
