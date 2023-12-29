const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');

const formats = ['esm', 'umd', 'cjs'];

module.exports = formats.map(format => ({
  input: 'src/index.js',
  output: {
    file: `dist/minifw.${format}.js`,
    format,
    name: 'MiniFw'
  },
  plugins: [
      nodeResolve(),
      commonjs(),
      terser(),
  ]
}));