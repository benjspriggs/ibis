/// <reference types="node" />
import spdy from "spdy";
import { IncomingMessage, ServerResponse } from "http";
export declare const createServer: (app: (request: IncomingMessage, response: ServerResponse) => void, options?: spdy.server.ServerOptions) => Promise<{}>;
