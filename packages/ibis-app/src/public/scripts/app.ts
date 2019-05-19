import "./semantic-api"
import { CategorizedSearchResult, SearchResult } from "ibis-api"
import { Searchable } from "fomantic-ui"

declare var $: JQueryStatic

function formatBackendResource(url: string) {
    const u = new URL(url)

    const [
        _,
        first,
        ...rest
     ] = u.pathname.split("/")

     if (first === "rx") {
         return `/materia-medica/${rest.join("/")}`
     } else if (first == "tx") {
         return `/therapeutics/${rest.join("/")}`
     } else {
         throw new Error("unknown: " + first)
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
