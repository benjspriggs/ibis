import { RequestHandler } from "express";
import { modalities } from "ibis-lib";
export interface Modality {
    code: string;
    data: ModalityData;
}
export interface ModalityData {
    displayName: string;
}
export { modalities as modalities };
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
