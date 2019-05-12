'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FileAsync_1 = __importDefault(require("lowdb/adapters/FileAsync"));
const pify_1 = __importDefault(require("pify"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const graceful_fs_1 = __importDefault(require("graceful-fs"));
const readFile = pify_1.default(graceful_fs_1.default.readFile);
const writeFile = pify_1.default(write_file_atomic_1.default);
const whitespace = /^\s*$/.compile();
class BetterFileAsync extends FileAsync_1.default {
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!graceful_fs_1.default.existsSync(this.source)) {
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
