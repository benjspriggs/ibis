const del = require("del")
const gulp = require("gulp")
const ts = require("gulp-typescript")
const sourcemaps = require("gulp-sourcemaps")

const tsconfig = ts.createProject("./tsconfig.json")

gulp.task('clean', () => del("./dist"))

gulp.task('build', () => 
    tsconfig.src()
        .pipe(sourcemaps.init())
        .pipe(tsconfig())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
        .pipe(gulp.dest("./dist")))