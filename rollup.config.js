const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const sourceMaps = require('rollup-plugin-sourcemaps');
const typescript = require('@rollup/plugin-typescript');



const formats = ['esm', 'umd', 'cjs'];

module.exports = formats.map(format => ({
  input: 'src/index.ts',
  output: {
    file: `dist/minfw.${format}.js`,
    format,
    name: 'Min',
    sourcemap: true,
  },
  plugins: [
    typescript({
      typescript: require("typescript"),
      tsconfig: './tsconfig.json'
    }),
    sourceMaps(),
    nodeResolve(),
    commonjs(),
    terser({
      sourceMap: true
    }),
  ]
}));