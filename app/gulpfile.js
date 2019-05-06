//@ts-check
const { src, dest, watch, series, parallel, task } = require("gulp")
const { default: del } = require("del")
const newer = require("gulp-newer")
const glob = require("glob")
const ts = require("gulp-typescript")
const sourcemaps = require("gulp-sourcemaps")

const distributable = "dist"
const source = "src"

const nodeTsConfig = ts.createProject("./tsconfig.json")
const browserTsConfig = ts.createProject("./src/public/tsconfig.json")

const buildWithMaps = (tsconfig, destination) => {
    return tsconfig.src()
        .pipe(sourcemaps.init())
        .pipe(tsconfig())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
        .pipe(dest(destination));
};

const buildNode = () => buildWithMaps(nodeTsConfig, distributable)
const buildBrowser = () => buildWithMaps(browserTsConfig, distributable + '/public/scripts')

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
    watch(["src/**/*.ts", "!src/public/**/*.ts"], buildNode)
    watch(["src/public/**/*"], buildBrowser)
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

task('clean', parallel(cleanStaticAssets, cleanStaticSources))

task('watch', watchStaticAssets)
task("node", buildNode);
task("browser", buildBrowser);
task('build', parallel('node', 'browser'))
task('default', series('copy', 'build'))