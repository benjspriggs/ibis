let app;

try {
    app = require("./out/index")
} catch {
    app = require("./dist/index")
}

app.start()
