import "./semantic-api"
import { CategorizedSearchResult, SearchResult } from "ibis-api"
import { Searchable } from "fomantic-ui"

declare var $: JQueryStatic

function formatBackendResource(url: string) {
    let first: string;
    let rest: string[];

    try {
        const u = new URL(url)

        const parts = u.pathname.split("/")
        first = parts[1];
        rest = parts.splice(2);
    } catch (e) {
        const parts = url.split("/")
        first = parts[0];
        rest = parts.splice(1);
    }

     if (first === "rx") {
         return `/materia-medica/${rest.join("/")}`
     } else if (first == "tx") {
         return `/therapeutics/${rest.join("/")}`
     } else {
         throw new Error("unknown backend resource: " + url)
     }
}

$(document).ready(() => {
    $("#modality-menu-toggle").click(() => {
        let menu: any = $("#modality-menu") as any;
        if (menu) {
            menu.sidebar("toggle")
        }
    });

    ($(".ui.button.htm-link") as any).api({
        encodeParameters: false,
        onSuccess: (data: any) => {
            console.dir(data)
        }
    });

    ($("a[data-role='entry-link']")).each((_, element) => {
        var relativePath = $(element).attr('data-relative-location');
        $(element).attr('href', formatBackendResource(relativePath));
    });

    ($(".ui.search") as Searchable).search({
        apiSettings: {
            onResponse: (data: SearchResult) => {
                return ({
                    ...data,
                    results: data.results.map(result => ({
                        ...result,
                        category: result.modality.data.displayName,
                        title: result.header.name,
                        url: formatBackendResource(result.url)
                    }))
                })
            }
        }
    });

    ($(".ui.search.categorize") as Searchable).search({
        type: "category",
        apiSettings: {
            onResponse: (data: CategorizedSearchResult) => {
                return ({
                    ...data,
                    results: Object.keys(data.results).reduce((acc: any, category) => {
                        const d = data.results[category]
                        acc[category] = ({
                            ...d,
                            results: d.results.map(result => ({
                                category: result.modality.data.displayName,
                                title: result.header.name,
                                url: formatBackendResource(result.url)
                            }))
                        })
                        return acc
                    }, {})
                })
            }
        }
    });
})
