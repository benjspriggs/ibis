import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: './src/public/scripts/app.ts',
    output: {
        file: './dist/public/scripts/app.js',
        format: 'iife'
    },
    external: ['fs', 'path'],
 
    plugins: [
        resolve(),
        commonjs({
        }),
        typescript({
            tsconfig: './src/public/tsconfig.json'
        }),
    ]
}