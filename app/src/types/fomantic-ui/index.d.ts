declare interface JQueryStatic {
    // TODO: add api types from fomantic-ui
    api: any
}

declare module "fomantic-ui" {

    export interface Searchable extends JQuery<HTMLElement> {
        search: (options?: SemanticSearchOptions) => void;
    }

    export interface SearchResult {
        title: string,
        url?: string,
        price?: string,
        actionUrl?: string,
        action?: string,
        description?: string,
    }

    export interface SemanticSearchOptions {
        type?: string,
        apiSettings?: any,
        minCharacters?: number,
        onResponse?: (data: any) => ({ results: SearchResult[] })
    }
}