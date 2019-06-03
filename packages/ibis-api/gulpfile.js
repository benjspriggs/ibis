// @ts-check
const del = require("del")
const gulp = require("gulp")
const { build } = require("./../gulpfile.js")

gulp.task('clean', () => del("./dist"))

gulp.task('buildJS', () => build("./tsconfig.js.json").pipe(gulp.dest("./dist")))

gulp.task('buildTS', () => build("./tsconfig.json").pipe(gulp.dest("./dist")))

gulp.task('build', gulp.parallel(['buildJS', 'buildTS']))
