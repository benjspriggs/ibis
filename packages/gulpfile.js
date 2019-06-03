// @ts-check
const sourcemaps = require("gulp-sourcemaps")
const ts = require("gulp-typescript")

/**
 * @param {string} config Path to a tsconfig.json.
 * @returns A stream that can be `gulp.pipe`'d to a destination.
 */
exports.build = (config) => {
    const project = ts.createProject(config)

    return project.src()
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(sourcemaps.write('.', { sourceRoot: "./", includeContent: false }))
}
