import { Header } from "ibis-lib";
export declare function getFileInfo(absoluteFilePath: string, modality: string, listing: string[]): Promise<{
    filename: string;
    header: Header;
}[]>;
export declare const getListing: (absoluteFilePath: string, modality: string) => Promise<string[]>;
declare const _default;
export default _default;
