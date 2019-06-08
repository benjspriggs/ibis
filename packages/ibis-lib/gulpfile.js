// @ts-check
const package = require("./package.json")
const { project } = require("./../../gulpfile")

const { build, clean } = project(package)

exports.build = build;
exports.clean = clean;
