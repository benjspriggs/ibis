'use strict';

import FileAsync from 'lowdb/adapters/FileAsync'
import pify from 'pify'
import write from 'write-file-atomic'
import fs from 'graceful-fs'

const readFile = pify(fs.readFile);
const writeFile = pify(write);

const whitespace = /^\s*$/.compile()

class BetterFileAsync extends FileAsync {
    async read() {
        if (!fs.existsSync(this.source)) {
            return writeFile(this.source, this.serialize(this.defaultValue)).then(
                () => this.defaultValue
            )
        }

        try {
            // Read database
            const data = await readFile(this.source, 'utf-8')

            if (whitespace.test(data)) {
                return this.deserialize(data.trim())
            } else {
                return this.defaultValue
            }
        } catch (e) {
            if (e instanceof SyntaxError) {
                e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
            }
            throw e
        }
    }

    write(data) {
        return writeFile(this.source, this.serialize(data))
    }
}

module.exports = BetterFileAsync