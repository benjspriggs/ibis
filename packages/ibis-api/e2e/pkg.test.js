// @ts-check
const tests = require("./common");
const { join } = require("path");

let entryPoint;

switch (process.platform) {
    case "darwin":
        entryPoint = "ibis-api-macos";
        break;
    case "win32":
        entryPoint = "ibis-api-win.exe";
        break;
    default:
        entryPoint = "ibis-api-linux";
        break;
}

tests({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "api (pkg)"
})
