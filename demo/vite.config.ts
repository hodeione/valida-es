import { defineConfig } from 'vite'

// La demo importa el código fuente de la librería directamente (../src).
export default defineConfig({
  root: __dirname,
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
})
