// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

module.exports = function(options) {
    const port = 8080 + Math.floor(Math.random() * 100)

    process.env.APP_PORT = port.toString();

    const withApi = withEntrypoint(options)

    test("It should serve a 200 for root", withApi, async (t) => {
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

    test.todo("It should serve CSS from the static path")

    test.todo("It should serve HTML")

    test.todo("It should 404 on nonexistent paths")
};