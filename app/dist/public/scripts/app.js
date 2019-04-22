"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./semantic.api");
function formatBackendResource(url) {
    var u = new URL(url);
    var _a = u.pathname.split("/"), _ = _a[0], first = _a[1], rest = _a.slice(2);
    if (first === "rx") {
        return "/materia-medica/" + rest.join("/");
    }
    else if (first == "tx") {
        return "/therapeutics/" + rest.join("/");
    }
    else {
        throw new Error("unknown: " + first);
    }
}
$(document).ready(function () {
    $("#modality-menu-toggle").click(function () {
        var menu = $("#modality-menu");
        if (menu) {
            menu.sidebar("toggle");
        }
    });
    $(".ui.button.htm-link").api({
        encodeParameters: false,
        onSuccess: function (data) {
            console.dir(data);
        }
    });
    $(".ui.search").search({
        apiSettings: {
            onResponse: function (data) {
                return (__assign({}, data, { results: data.results.map(function (result) { return (__assign({}, result, { category: result.modality.data.displayName, title: result.header.name, url: formatBackendResource(result.url) })); }) }));
            }
        }
    });
    $(".ui.search.categorize").search({
        type: "category",
        apiSettings: {
            onResponse: function (data) {
                return (__assign({}, data, { results: Object.keys(data.results).reduce(function (acc, category) {
                        var d = data.results[category];
                        acc[category] = (__assign({}, d, { results: d.results.map(function (result) { return ({
                                category: result.modality.data.displayName,
                                title: result.header.name,
                                url: formatBackendResource(result.url)
                            }); }) }));
                        return acc;
                    }, {}) }));
            }
        }
    });
});
//# sourceMappingURL=app.js.map