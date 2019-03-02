//@ts-check
const fs = require("fs")
const { src, dest, watch, series } = require("gulp")
const clean = require("gulp-clean")
const newer = require("gulp-newer")
const glob = require("glob")
const browserify = require("browserify")

const distributable = "dist"
const source = "src"

/**
 * @param {string} prefix
 */
function staticAssets(prefix) {
    return ["**/*.hbs", "**/*.css"].map(pattern => `${prefix}/${pattern}`)
}

/**
 * 
 * @param {any} _cb 
 */
function watchStaticAssets(_cb) {
    watch(staticAssets(source), series(cleanStaticAssets, copyStaticAssets))
    watch(["dist/public/scripts/*.js", "!dist/public/scripts/main.js"], createClientBundle)
    _cb()
}

function cleanStaticAssets() {
    return src(staticAssets(distributable), { read: false })
        .pipe(clean())
}

function copyStaticAssets() {
    return src(staticAssets(source))
        .pipe(newer(distributable))
        .pipe(dest(distributable))
}

function createClientBundle() {
    return browserify({
        entries: "dist/public/scripts/app.js",
        debug: true
    })
    .bundle()
    .pipe(fs.createWriteStream("dist/public/scripts/main.js"))
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

exports.copy = copyStaticAssets
exports.clean = cleanStaticAssets
exports.watch = watchStaticAssets
exports.default = series(cleanStaticAssets, copyStaticAssets, createClientBundle)