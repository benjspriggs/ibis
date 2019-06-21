// @ts-check
const package = require("./package.json")
const { task } = require("gulp")
const { project } = require("./../../gulpfile")

const { build, clean, compress, bundle, package: pkg } = project(package)

exports.build = build;
exports.clean = clean;
exports.compress = compress;
exports.bundle = bundle;
exports.package = pkg;
