import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    lib: {
      entry: 'src/index.ts',
      fileName: 'minfw-app',
      formats: ['es'] // default is ['es', 'umd']
    },
  },
});
