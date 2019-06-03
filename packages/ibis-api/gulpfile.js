// @ts-check
const { task } = require("gulp")
const { project } = require("./../../gulpfile")

const { build, clean } = project({
    paths: {
        dist: "./dist",
        tsconfig: ["./tsconfig.json", "./tsconfig.js.json"]
    }
})

exports.build = build;
exports.clean = clean;
