export const apiHostname = `${location.protocol}//127.0.0.1:3000`
import { FomanicJqueryStatic } from "fomantic-ui";

declare var $: FomanicJqueryStatic;

$.api.settings.verbose = true

$.api.settings.api = {
    'search monographs': `${apiHostname}/data/monographs?q={query}`,
    'search diseases': `${apiHostname}/data/diseases?q={query}&categorize=true`,
    'search treatments': `${apiHostname}/data/treatments?q={query}&categorize=true`,
    'search': `${apiHostname}/data?q={query}`
}