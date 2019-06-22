//@ts-check
const package = require("./package.json")
const { series, parallel, task } = require("gulp")
const ts = require("gulp-typescript")
const rollup = require("gulp-better-rollup")
const { terser } = require("rollup-plugin-terser")

const { project } = require("./../../gulpfile")

const { build, clean, compress, bundle, copy, package: pkg } = project(package)

task('copy', copy)

task('clean', clean)

function buildPublicScripts() {
    const publicScriptProjects = ts.createProject("./src/public/tsconfig.json")

    return publicScriptProjects.src()
        .pipe(publicScriptProjects())
        .pipe(rollup({
            plugins: [
                terser()
            ]
        }, {
            format: 'iife',
            browser: true
        }))
}

task('build', series(build, buildPublicScripts))

task('compress', compress)
task('bundle', bundle)
task('package', pkg)
task('default', parallel('copy', 'build'))