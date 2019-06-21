// @ts-check
const tests = require("./common");
const { join } = require("path");

let entryPoint;

switch (process.platform) {
    case "darwin":
        entryPoint = "ibis-app-macos";
        break;
    case "win32":
        entryPoint = "ibis-app-win.exe";
        break;
    default:
        entryPoint = "ibis-app-linux";
        break;
}

tests({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "app (pkg)"
})
