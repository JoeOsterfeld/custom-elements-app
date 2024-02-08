import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    lib: {
      entry: 'src/index.ts',
      name: 'Min',
      fileName: 'minfw',
      formats: ['es', 'umd'] // default is ['es', 'umd']
    },
  },
  plugins: [dts({ rollupTypes: true })]
});
