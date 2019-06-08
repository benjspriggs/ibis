// @ts-check
const sourcemaps = require("gulp-sourcemaps")
const ts = require("gulp-typescript")
const del = require("del")
const gulp = require("gulp")
const rollup = require("gulp-better-rollup")
const { uglify } = require("rollup-plugin-uglify")
const commonjs = require("rollup-plugin-commonjs")

function project({
    paths: {
        main: main = "./start.js",
        tsconfig: tsconfig = "./tsconfig.json",
        dist: dist = "./dist",
        out: out = "./out"
    }
}) {
    function localBuild(done) {
        if (Array.isArray(tsconfig)) {
            const tasks = tsconfig.map(config => {
                const nestedTask = () => build(config).pipe(gulp.dest(dist))
                nestedTask.displayName = "Building Typescript sources from tsconfig: " + config
                return nestedTask
            })
            return gulp.parallel(...tasks)(done)
        } else {
            return build(tsconfig).pipe(gulp.dest(dist))
        }
    }

    function compress(){
        return gulp.src([`${dist}/**/*.js`, `!${dist}/**/*.test.js`])
            .pipe(rollup({
                plugins: [
                    commonjs({
                        include: /node_modules/
                    }),
                    uglify()
                ],
            }, {
                format: "iife"
            }))
            .pipe(gulp.dest(out))
    }

    function cleanFolder(folder){
        const cleanTask = () => del(folder)
        cleanTask.displayName = "Removing all files in " + folder
        return cleanTask
    }

    const clean = gulp.parallel(cleanFolder(dist), cleanFolder(out))

    const bundle = gulp.series(clean, localBuild, compress)

    function package() {
        const { exec } = require("pkg")

        return exec([main, '--out-path', dist])
    }

    return {
        build: localBuild,
        clean: clean,
        compress: compress,
        bundle: bundle,
        package: gulp.series(bundle, package)
    }
}

/**
 * @param {string} config Path to a tsconfig.json.
 * @returns A stream that can be `gulp.pipe`'d to a destination.
 */
function build(config) {
    const project = ts.createProject(config)

    return project.src()
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
}

exports.build = build;
exports.project = project;