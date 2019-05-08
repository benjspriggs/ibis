import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: './src/public/scripts/app.ts',
    output: {
        file: './dist/public/scripts/app.js',
        format: 'iife'
    },
 
    plugins: [
        resolve(),
        commonjs({
            include: ['./node_modules/**', '../lib/node_modules/**', '../api/node_modules/**'],
            namedExports: {
                '../lib/node_modules/lodash/lodash.js': ['flatten']
            }
        }),
        typescript({
            tsconfig: './src/public/tsconfig.json'
        }),
    ]
}