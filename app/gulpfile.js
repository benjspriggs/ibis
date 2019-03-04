//@ts-check
const fs = require("fs")
const { src, dest, watch, series, parallel, task } = require("gulp")
const { default: del } = require("del")
const newer = require("gulp-newer")
const glob = require("glob")
const browserify = require("browserify")
const shakeify = require("common-shakeify")

const distributable = "dist"
const source = "src"

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
    watch(["dist/public/scripts/*.js", "!dist/public/scripts/main.js"], createClientBundle)
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

function createClientBundle(done) {
    browserify({
        entries: "dist/public/scripts/app.js",
        debug: true
    })
    .plugin(shakeify, { verbose: true })
    .bundle()
    .pipe(fs.createWriteStream("dist/public/scripts/main.js"))
    done()
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

task('clean', parallel(cleanStaticAssets, cleanStaticSources))

task('watch', watchStaticAssets)
task('bundle', createClientBundle)
//@ts-ignore
task('default', series('clean', parallel('copy', 'bundle')))