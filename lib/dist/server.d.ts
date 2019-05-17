/// <reference types="node" />
import http from "http";
export interface ServerOptions {
    key?: string;
    cert?: string;
}
export declare const h2: (app: (request: http.IncomingMessage, response: http.ServerResponse) => void) => Promise<http.Server | import("https").Server>;
