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
const resolve = require("rollup-plugin-node-resolve")
const babel = require("rollup-plugin-babel")

function project({
    paths: {
        tsconfig: tsconfig = "./tsconfig.json",
        src: src = "./src",
        dist: dist = "./dist",
        out: out = "./out",
        scripts: scripts = ["dist/**/*.js"],
        /**
         * Assumed to be copied from {@link src}.
         */
        static: static = [],
        /**
         * Copied as is to {@link dist} and {@link out}.
         */
        vendor: vendor = []
    }
}) {
    const stream = (a, base) => gulp.src(a, { base: base })

    const copy = (title, a, base) => (destination) => (done) => {
        if (a && a.length <= 0) {
            done()
        } else {
            return stream(a, base)
                .pipe(debug({ title: `${title} -> ${destination}` }))
                .pipe(newer(destination))
                .pipe(gulp.dest(destination))
        }
    }

    const copyStatic = copy("copying static assets", static, src)
    const copyVendor = copy("copying vendor assets", vendor, ".")

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

    const copyStaticSourcesToDestination = gulp.series(copyStatic(dist), copyVendor(dist))

    const copyStaticSourcesToCompressed = gulp.series(copyStatic(out), copyVendor(out))

    const clean = gulp.parallel(cleanFolder(dist), cleanFolder(out))

    const bundle = gulp.series(copyStaticSourcesToCompressed, compress)

    function package(done) {
        try {
            const args = ["./package.json", '--out-path', dist]
            const { exec } = require("pkg")

            return exec(args)
                .catch(done)
                .then(done)
        } catch (e) {
            done(e)
        }
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