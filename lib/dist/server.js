"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spdy_1 = __importDefault(require("spdy"));
const pem_1 = __importDefault(require("pem"));
exports.createServer = (app, options) => new Promise((resolve, reject) => {
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
