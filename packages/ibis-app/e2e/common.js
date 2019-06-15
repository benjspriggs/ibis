// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

const fetchAndOk = (url) => (t) => new Promise((resolve, reject) => {
            get(url)
                .on('response', (response) => {
                    t.is(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

const fetchAndNotOk = (url) => (t) => new Promise((resolve, reject) => {
            get(url)
                .on('response', (response) => {
                    t.not(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

module.exports = function(options) {
    const port = 8080 + Math.floor(Math.random() * 100)

    process.env.APP_PORT = port.toString();

    const withApp = withEntrypoint(options)

    test("It should serve a 200 for root", withApp, fetchAndOk(`http://localhost:${port}`))

    test("It should serve JS from the static path", withApp, fetchAndOk(`http://localhost:${port}/assets/scripts/app.js`))

    test("It should serve CSS from the static path",  withApp, fetchAndOk(`http://localhost:${port}/assets/semantic/semantic.min.css`))

    test("It should serve HTML", withApp, fetchAndOk(`http://localhost:${port}/`))

    test("It should 404 on nonexistent paths", withApp, fetchAndNotOk(`http://localhost:${port}/assets/magic/and/fooey`))
};