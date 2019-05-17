/// <reference types="node" />
import spdy from "spdy";
import { IncomingMessage, ServerResponse } from "http";
export interface ServerOptions {
    key?: string;
    cert?: string;
}
export declare const parseServerOptions: () => Promise<ServerOptions>;
export declare const createServer: (app: (request: IncomingMessage, response: ServerResponse) => void, options?: spdy.server.ServerOptions) => Promise<import("https").Server>;
