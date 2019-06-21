// @ts-check
const tests = require("./common");
const { join } = require("path");

tests({
    command: "node", 
    args: [join(__dirname, "..", "start.js")],
    prefix: "api (js)"
})
