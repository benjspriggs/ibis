// @ts-check
const package = require("./package.json")
const { project } = require("./../../gulpfile")

const { build, buildFast, clean, compress, bundle } = project(package)

exports.build = build;
exports.buildFast = buildFast;
exports.clean = clean;
exports.compress = compress;
exports.bundle = bundle;
