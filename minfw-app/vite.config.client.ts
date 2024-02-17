import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist/static'
  },
  server: {
    port: 8080,
    cors: true,
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    }
  }
});
