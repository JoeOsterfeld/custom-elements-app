const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const sourceMaps = require('rollup-plugin-sourcemaps');


const formats = ['esm', 'umd', 'cjs'];

module.exports = formats.map(format => ({
  input: 'src/index.js',
  output: {
    file: `dist/minifw.${format}.js`,
    format,
    name: 'MiniFw',
    sourcemap: true,
  },
  plugins: [
      sourceMaps(),
      nodeResolve(),
      commonjs(),
      terser({
        sourceMap: true
      }),
  ]
}));