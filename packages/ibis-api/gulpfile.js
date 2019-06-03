const del = require("del")
const gulp = require("gulp")
const ts = require("gulp-typescript")
const sourcemaps = require("gulp-sourcemaps")

const tsconfig = ts.createProject("./tsconfig.json")
const jsconfig = ts.createProject("./tsconfig.js.json")

const build = (config) => config.src()
        .pipe(sourcemaps.init())
        .pipe(config())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
        .pipe(gulp.dest("./dist"))

gulp.task('clean', () => del("./dist"))

gulp.task('buildJS', () => build(jsconfig))

gulp.task('buildTS', () => build(tsconfig))

gulp.task('build', gulp.parallel(['buildJS', 'buildTS']))
