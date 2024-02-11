import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: './template/public',
  build: {
    outDir: 'template/dist',
    sourcemap: true,
    minify: 'terser',
    lib: {
      entry: 'template/src/app.ts',
      fileName: 'app',
      name: 'App',
      formats: ['cjs'],
    },
  },
});
