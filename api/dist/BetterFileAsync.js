'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import FileAsync from 'lowdb/adapters/FileAsync';
import pify from 'pify';
import write from 'write-file-atomic';
import fs from 'graceful-fs';
const readFile = pify(fs.readFile);
const writeFile = pify(write);
const whitespace = /^\s*$/.compile();
class BetterFileAsync extends FileAsync {
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync(this.source)) {
                return writeFile(this.source, this.serialize(this.defaultValue)).then(() => this.defaultValue);
            }
            try {
                // Read database
                const data = yield readFile(this.source, 'utf-8');
                if (whitespace.test(data)) {
                    return this.deserialize(data.trim());
                }
                else {
                    return this.defaultValue;
                }
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    e.message = `Malformed JSON in file: ${this.source}\n${e.message}`;
                }
                throw e;
            }
        });
    }
    write(data) {
        return writeFile(this.source, this.serialize(data));
    }
}
module.exports = BetterFileAsync;
//# sourceMappingURL=BetterFileAsync.js.map