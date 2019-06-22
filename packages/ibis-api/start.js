let args = process.argv.slice(2)

if (args.length >= 1 && args[0] === 'dist') {
    require('./dist/index').start()
} else {
    let api;

    try {
        api = require("./out/index")
    } catch {
        api = require("./dist/index")
    }

    api.start()
}