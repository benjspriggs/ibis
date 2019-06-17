// @ts-check
const sourcemaps = require("gulp-sourcemaps")
const ts = require("gulp-typescript")
const del = require("del")
const gulp = require("gulp")
const debug = require("gulp-debug")
const rollup = require("gulp-better-rollup")
const newer = require("gulp-newer")
const { terser } = require("rollup-plugin-terser")
const json = require("rollup-plugin-json")
const commonjs = require("rollup-plugin-commonjs")
const resolve = require("rollup-plugin-node-resolve")
const babel = require("rollup-plugin-babel")

function project({
    paths: {
        tsconfig: tsconfig = "./tsconfig.json",
        dist: dist = "./dist",
        out: out = "./out",
        scripts: scripts = ["dist/**/*.js"],
        static: static = []
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
        return gulp.src(scripts)
            .pipe(debug({ title: "compressing" }))
            .pipe(rollup({
                plugins: [
                    json(),
                    resolve({
                        preferBuiltins: true
                    }),
                    babel({
                        exclude: "node_modules/**",
                        presets: ["@babel/preset-env"],
                    }),
                    terser()
                ],
            }, {
                format: "cjs",
                exports: "named",
                browser: false
            }))
            .pipe(gulp.dest(out))
    }

    function cleanFolder(folder){
        const cleanTask = () => del(folder)
        cleanTask.displayName = "Removing all files in " + folder
        return cleanTask
    }

    function copyStaticSourcesToDestination(done) {
        if (static && static.length > 1) {
            return gulp.src(static, { "base": "." })
                .pipe(newer(dist))
                .pipe(gulp.dest(dist))
        } else {
            done()
        }
    }

    function copyStaticSourcesToCompressed(done) {
        if (static && static.length > 1) {
            return gulp.src(static, { "base": "." })
                .pipe(newer(out))
                .pipe(gulp.dest(out))
        } else {
            done()
        }
    }

    const clean = gulp.parallel(cleanFolder(dist), cleanFolder(out))

    const bundle = gulp.parallel(compress, copyStaticSourcesToCompressed)

    function package() {
        const { exec } = require("pkg")

        return exec(["./package.json", '--out-path', dist])
    }

    return {
        copy: copyStaticSourcesToDestination,
        build: gulp.series(copyStaticSourcesToDestination, localBuild),
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