//@ts-check
const package = require("./package.json")
const { series, task } = require("gulp")

const { project } = require("./../../gulpfile")

const { build, clean, compress, bundle, copy, package: pkg } = project(package)

task('copy', copy)

task('clean', clean)

task('build', build)
task('compress', compress)
task('bundle', bundle)
task('package', pkg)
task('default', series('copy', 'build'))