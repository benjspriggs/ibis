// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

const fetchAndOk = (endpoint) => (t, port) => new Promise((resolve, reject) => {
            get(`http://localhost:${port}${endpoint}`)
                .on('response', (response) => {
                    t.is(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

const fetchAndNotOk = (endpoint) => (t, port) => new Promise((resolve, reject) => {
            get(`http://localhost:${port}/${endpoint}`)
                .on('response', (response) => {
                    t.not(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

module.exports = function(options) {
    const withApp = withEntrypoint({ ...options, host_env: "APP_HOSTNAME", port_env: "APP_PORT" })

    test("It should serve a 200 for root", withApp, fetchAndOk('/'))

    test("It should serve JS from the static path", withApp, fetchAndOk("/assets/scripts/app.js"))

    test("It should serve CSS from the static path", withApp, fetchAndOk("/assets/semantic/semantic.min.css"))

    test("It should serve TTF fonts from the static path", withApp, fetchAndOk("/assets/semantic/default/assets/fonts/icons.ttf"))

    test("It should serve WOFF fonts from the static path", withApp, fetchAndOk("/assets/semantic/default/assets/fonts/icons.woff"))

    test("It should serve HTML", withApp, fetchAndOk("/"))

    test("It should 404 on nonexistent paths", withApp, fetchAndNotOk("/assets/magic/and/fooey"))

    test("It should 404 for favicons", withApp, fetchAndNotOk("/assets/favicon.ico"))
};