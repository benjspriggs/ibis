'use strict';

import FileAsync from 'lowdb/adapters/FileAsync'
import pify from 'pify'
import write from 'write-file-atomic'
import fs from 'graceful-fs'

const readFile = pify(fs.readFile);
const writeFile = pify(write);

const whitespace = /^\s*$/.compile()

class BetterFileAsync extends FileAsync {
    read() {
        if (!fs.existsSync(this.source)) {
            return writeFile(this.source, this.serialize(this.defaultValue))
                .then(() => this.defaultValue)
        }

        // Read database
        return readFile(this.source, 'utf-8')
            .then(data => {
                if (whitespace.test(data)) {
                    return this.deserialize(data.trim())
                } else {
                    return this.defaultValue
                }
            });
    }

    write(data) {
        return writeFile(this.source, this.serialize(data))
    }
}

module.exports = BetterFileAsync