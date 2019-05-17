"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spdy_1 = __importDefault(require("spdy"));
const http_1 = __importDefault(require("http"));
const pem_1 = __importDefault(require("pem"));
const commander_1 = __importDefault(require("commander"));
const fs_1 = require("fs");
const parseServerOptions = () => new Promise((resolve, reject) => {
    try {
        commander_1.default
            .option("-k, --key [key]", "The HTTPs key to use")
            .option("-c, --cert [cert]", "The HTTPs cert to use")
            .parse(process.argv);
        resolve(commander_1.default);
    }
    catch (e) {
        reject(e);
    }
});
const createServer = (app, options) => new Promise((resolve, reject) => {
    if (options && options.key && options.cert) {
        resolve(spdy_1.default.createServer(options, app));
    }
    else {
        pem_1.default.createCertificate({
            days: 1,
            selfSigned: true
        }, (err, keys) => {
            if (err) {
                reject(err);
            }
            else {
                const serverOptions = Object.assign({
                    key: keys.serviceKey,
                    cert: keys.certificate
                }, options);
                resolve(spdy_1.default.createServer(serverOptions, app));
            }
        });
    }
});
exports.h2 = async (app) => {
    const options = await parseServerOptions();
    if (options.key && options.cert) {
        console.log('setting up https');
        return createServer(app, {
            key: fs_1.readFileSync(options.key),
            cert: fs_1.readFileSync(options.cert)
        });
    }
    else {
        console.log('setting up http');
        return Promise.resolve(http_1.default.createServer(app));
    }
};
