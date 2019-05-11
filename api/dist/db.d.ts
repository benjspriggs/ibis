import { Header, Modality } from "ibis-lib";
import { Router } from "express";
export interface Directory {
    url: string;
    modality: Modality;
    header: Header;
}
export interface Database {
    diseases: Directory[];
    treatments: Directory[];
}
export interface Query {
    text: string;
    modality?: string;
}
export declare function query(text: string): Query;
declare const router: Router;
export interface SearchResult {
    query: string;
    directory: string;
    results: Directory[];
}
export interface CategorizedSearchResult {
    query: string;
    directory: string;
    results: CategorizedSearchMap;
}
export interface CategorizedSearchMap {
    [name: string]: {
        name: string;
        results: Directory[];
    };
}
export declare function initialize(): Promise<void>;
export default router;
