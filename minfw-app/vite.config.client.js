import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: './template/public',
  // appType: 'spa',
  build: {
    outDir: 'template/dist/client',
    sourcemap: true,
    minify: 'terser',
    lib: {
      entry: 'template/src/client/app.ts',
      fileName: 'app',
      name: 'App',
      formats: ['iife'] // ['cjs'],
    },
  },
});
