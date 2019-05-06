//@ts-check
import { apiHostname } from "ibis-api/dist/config";
$.api.settings.verbose = true;
$.api.settings.api = {
    'search treatments': `${apiHostname}/data/treatments?q={query}`,
    'search diseases': `${apiHostname}/data/diseases?q={query}&categorize=true`,
    'search': `${apiHostname}/data?q={query}`
};
//# sourceMappingURL=semantic.api.js.map