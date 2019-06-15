// @ts-check
import tests from "./common"
import { join } from "path";

let entryPoint;

switch (process.platform) {
    case "darwin":
        entryPoint = "start-macos";
        break;
    case "win32":
        entryPoint = "start-win.exe";
        break;
    default:
        entryPoint = "start-linux";
        break;
}

tests({
    command: join(__dirname, '..', 'dist', entryPoint),
    args: [],
    prefix: "app (pkg)"
})
