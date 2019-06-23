import "./semantic-api"
import { CategorizedSearchResult, SearchResult } from "ibis-api"
import { Searchable } from "fomantic-ui"

declare var $: JQueryStatic

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
                        title: result.header.name
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
                                ...result,
                                category: result.modality.data.displayName,
                                title: result.header.name
                            }))
                        })
                        return acc
                    }, {})
                })
            }
        }
    });
})
