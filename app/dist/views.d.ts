import { Application } from "express";
declare const app: Application;
export declare const menuItems: {
    destination: string;
    title: string;
    external?: boolean;
    endpoint?: string;
    needs_modalities?: boolean;
    route?: string;
}[];
export declare const getMenuItemBy: {
    destination: (destination: string) => {
        destination: string;
        title: string;
        external?: boolean;
        endpoint?: string;
        needs_modalities?: boolean;
        route?: string;
    };
    title: (title: string) => {
        destination: string;
        title: string;
        external?: boolean;
        endpoint?: string;
        needs_modalities?: boolean;
        route?: string;
    };
};
export default app;
