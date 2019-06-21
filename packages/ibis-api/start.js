let api;

try {
    api = require("./out/index")
} catch {
    api = require("./dist/index")
}

api.start()
