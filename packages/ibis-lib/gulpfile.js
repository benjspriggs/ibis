// @ts-check
const { project } = require("./../../gulpfile")

const { build, clean } = project({
    paths: {
        dist: "./dist",
        tsconfig: "./tsconfig.json"
    }
})

exports.build = build;
exports.clean = clean;
