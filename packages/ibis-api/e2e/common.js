// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

module.exports = function(options) {
    const withApi = withEntrypoint({ ...options, port_env: "API_PORT" })

    test("It should serve a 200 for root", withApi, async (t, port) => {
        await new Promise((resolve, reject) => {
            get(`http://localhost:${port}`)
                .on('response', (response) => {
                    t.is(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });
    })
};