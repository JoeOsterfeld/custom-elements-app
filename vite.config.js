import { defineConfig } from 'vite';

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
});
