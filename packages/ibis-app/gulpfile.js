//@ts-check
const package = require("./package.json")
const { watch, series, task } = require("gulp")
const glob = require("glob")

const { project } = require("./../../gulpfile")

const source = "src"

const { build, clean, compress, bundle, copy, package: pkg } = project(package)

/**
 * @param {string} prefix
 */
function staticAssets(prefix) {
    return ["semantic/**/*", "**/*.hbs", "**/*.css"].map(pattern => `${prefix}/${pattern}`)
}

/**
 * 
 * @param {any} done 
 */
function watchStaticAssets(done) {
    watch(staticAssets(source), series(clean, copy))
    watch(["src/**/*.ts", "!src/public/**/*.ts"], build)
    return done()
}

/**
 * @param {any} cb
 */
exports.ls = function (cb) {
    staticAssets(source).forEach(pattern => {
        glob(pattern, function (err, files) {
            if (err) {
                return cb(err)
            }
            console.log(files)
        })
    })
    cb()
}

task('copy', copy)

task('clean', clean)

task('watch', watchStaticAssets)
task('build', build)
task('compress', compress)
task('bundle', bundle)
task('package', pkg)
task('default', series('copy', 'build'))