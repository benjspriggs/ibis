//@ts-check
const package = require("./package.json")
const { src, dest, watch, series, parallel, task } = require("gulp")
const del = require("del")
const newer = require("gulp-newer")
const glob = require("glob")

const { project } = require("./../../gulpfile")

const distributable = package.paths.dist
const source = "src"

const { build, clean, compress, bundle } = project(package)

/**
 * @param {string} prefix
 */
function staticAssets(prefix) {
    return ["semantic/**/*", "**/*.hbs", "**/*.css"].map(pattern => `${prefix}/${pattern}`)
}

const staticSources = ["semantic/**/*"]

/**
 * 
 * @param {any} done 
 */
function watchStaticAssets(done) {
    watch(staticAssets(source), series(cleanStaticAssets, copyStaticAssets))
    watch(["src/**/*.ts", "!src/public/**/*.ts"], build)
    return done()
}

function cleanStaticSources() {
    return del(staticSources.map(source => `dist/${source}/**/*`))
}

function cleanStaticAssets() {
    return del(staticAssets(distributable))
}

function copyStaticSources() {
    return src(staticSources, { "base": "." })
        .pipe(newer(distributable))
        .pipe(dest(distributable))
}

function copyStaticAssets() {
    return src(staticAssets(source))
        .pipe(newer(distributable))
        .pipe(dest(distributable))
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

task('copy', parallel(copyStaticAssets, copyStaticSources))

task('clean', clean)

task('clean-static', parallel(cleanStaticAssets, cleanStaticSources))

task('watch', watchStaticAssets)
task('build', build)
task('compress', compress)
task('bundle', bundle)
task('default', series('copy', 'build'))