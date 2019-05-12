export declare const port: number;
export declare const hostname: string;
export declare const apiHostname: string;
interface IConfig {
    paths: {
        ibisRoot: string;
        system: string;
        user: string;
        rx: string;
        tx: string;
    };
    relative: {
        ibisRoot: (...folders: string[]) => string;
    };
}
declare const config: IConfig;
export default config;
