// @ts-check
const { withEntrypoint } = require("ibis-lib");
const test = require("ava");
const { get } = require("request");

module.exports = function(options) {
    const randomPort = (t, run) => {
        const port = 3000 + Math.floor(Math.random() * 100)

        process.env.API_PORT = port.toString();

        return run(t, port)
    }

    const withApi = withEntrypoint(options)

    test("It should serve a 200 for root", randomPort, withApi, async (t, port) => {
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