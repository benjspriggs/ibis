//@ts-check
const package = require("./package.json")
const { parallel, task, dest } = require("gulp")
const ts = require("gulp-typescript")
const debug = require("gulp-debug")

const { project } = require("./../../gulpfile")

const { build, buildFast, clean, compress, bundle, copy, package: pkg } = project(package)

task('copy', copy)

task('clean', clean)

function buildPublicScripts() {
    const publicScriptProjects = ts.createProject("./src/public/tsconfig.json")

    return publicScriptProjects.src()
        .pipe(debug({ title: "compiling public script" }))
        .pipe(publicScriptProjects())
        .pipe(debug({ title: "compiled public script" }))
        .pipe(dest(package.paths.publicDist))
}

task('build', parallel(build, buildPublicScripts))
task('buildFast', parallel(buildFast, buildPublicScripts))

task('compress', compress)
task('bundle', bundle)
task('package', pkg)
task('default', parallel('copy', 'build'))