let args = process.argv.slice(2)

if (args.length >= 1 && args[0] === 'dist') {
    require('./dist/index').start()
} else {
    let app;

    try {
        app = require("./out/index")
    } catch {
        app = require("./dist/index")
    }

    app.start()
}