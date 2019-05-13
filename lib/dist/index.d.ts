import { RequestHandler } from "express";
export { createServer } from "./server";
export interface Modality {
    code: string;
    data: ModalityData;
}
export interface ModalityData {
    displayName: string;
}
export declare const modalities: {
    [code: string]: ModalityData;
};
export declare function getModality(codeOrDisplayName: string): Modality;
export interface Header {
    version: string;
    tag: string;
    name: string;
    category: string;
}
export declare function parseHeaderFromFile(filepath: string): Header;
export declare function parseHeader(source: string): string[];
export declare const requestLogger: RequestHandler;
/**
 * See https://www.npmjs.com/package/pkg#snapshot-filesystem
 */
export declare function isPackaged(): boolean;
export declare const applicationRoot: {
    packaged: string;
    live: string;
};
