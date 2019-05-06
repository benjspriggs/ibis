(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./semantic-api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("./semantic-api");
    function formatBackendResource(url) {
        const u = new URL(url);
        const [_, first, ...rest] = u.pathname.split("/");
        if (first === "rx") {
            return `/materia-medica/${rest.join("/")}`;
        }
        else if (first == "tx") {
            return `/therapeutics/${rest.join("/")}`;
        }
        else {
            throw new Error("unknown: " + first);
        }
    }
    $(document).ready(() => {
        $("#modality-menu-toggle").click(() => {
            let menu = $("#modality-menu");
            if (menu) {
                menu.sidebar("toggle");
            }
        });
        $(".ui.button.htm-link").api({
            encodeParameters: false,
            onSuccess: (data) => {
                console.dir(data);
            }
        });
        $(".ui.search").search({
            apiSettings: {
                onResponse: (data) => {
                    return (Object.assign({}, data, { results: data.results.map(result => (Object.assign({}, result, { category: result.modality.data.displayName, title: result.header.name, url: formatBackendResource(result.url) }))) }));
                }
            }
        });
        $(".ui.search.categorize").search({
            type: "category",
            apiSettings: {
                onResponse: (data) => {
                    return (Object.assign({}, data, { results: Object.keys(data.results).reduce((acc, category) => {
                            const d = data.results[category];
                            acc[category] = (Object.assign({}, d, { results: d.results.map(result => ({
                                    category: result.modality.data.displayName,
                                    title: result.header.name,
                                    url: formatBackendResource(result.url)
                                })) }));
                            return acc;
                        }, {}) }));
                }
            }
        });
    });
});

//# sourceMappingURL=app.js.map
