//@ts-check
const apiHostname = 'https://localhost:3000'

$.api.settings.verbose = true

$.api.settings.api = {
    'search treatments': `${apiHostname}/data/treatments?q={query}`,
    'search diseases': `${apiHostname}/data/diseases?q={query}&categorize=true`,
    'search': `${apiHostname}/data?q={query}`
}