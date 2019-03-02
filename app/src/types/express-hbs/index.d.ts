declare module "express-hbs" {
    import handlebars from "handlebars"
    import jsb from "js-beautify"

    interface Options {
        handlebars?: typeof handlebars;
        defaultLayout?: string,
        partialsDir?: string,
        layoutsDir?: string,
        extname?: string,
        contentHelperName?: string,
        blockHelperName?: string,
        beautify?: boolean,
        onCompile?: (self: any, source: any, filename: any) => typeof handlebars.compile;
    }

    class ExpressHbs {
        handlebars: typeof Handlebars;
        SafeString: typeof Handlebars.SafeString;
        utils: typeof Handlebars.Utils;
        beautify: typeof jsb.html;
        beautifyrc: any;
        cwd: typeof process.cwd;
        content: (name: any, options: any, context: any) => any;
        layoutPath: (filename: string, layout: string) => string;
        declaredLayoutFile: (str: string, filename: string) => string | undefined;
        cacheLayout: (layoutFile: string, useCache: boolean, cb: Function) => void;
        // TODO
        cachePartials: any;
        express3: (options: Options) => any;
        express4: (options: Options) => any;
        loadDefaultLayout: any;
        registerHelper: any;
        registerPartial: any;
        compile: any;
        registerAsyncHelper: (context: any, fn: Function) => void;
        updateTemplateOptions: any;
        create: () => ExpressHbs;
        __express: any;
    }

    var exhbs: ExpressHbs;

    export = exhbs
}
