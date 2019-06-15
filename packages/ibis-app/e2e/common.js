// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

const fetchAndOk = (url) => (t, port) => new Promise((resolve, reject) => {
            get(url(port))
                .on('response', (response) => {
                    t.is(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

const fetchAndNotOk = (url) => (t, port) => new Promise((resolve, reject) => {
            get(url(port))
                .on('response', (response) => {
                    t.not(200, response.statusCode)
                    t.truthy(response.headers)
                    resolve()
                })
                .on('error', reject)
        });

module.exports = function(options) {
    const randomPort = (t, run) => {
        const port = 8080 + Math.floor(Math.random() * 100)

        process.env.APP_PORT = port.toString();

        return run(t, port)
    }

    const withApp = withEntrypoint(options)

    test("It should serve a 200 for root", randomPort, withApp, fetchAndOk(port => `http://localhost:${port}`))

    test("It should serve JS from the static path", randomPort, withApp, fetchAndOk(port => `http://localhost:${port}/assets/scripts/app.js`))

    test("It should serve CSS from the static path",  randomPort, withApp, fetchAndOk(port => `http://localhost:${port}/assets/semantic/semantic.min.css`))

    test("It should serve HTML", randomPort, withApp, fetchAndOk(port => `http://localhost:${port}/`))

    test("It should 404 on nonexistent paths", randomPort, withApp, fetchAndNotOk(port => `http://localhost:${port}/assets/magic/and/fooey`))
};