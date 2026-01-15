import { defineConfig } from 'electron-vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    build: {
      outDir: 'dist/main'
    }
  },
  preload: {
    entry: 'src/preload/index.ts',
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: 'index.js'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    build: {
      outDir: '../../dist/renderer'
    }
  }
})
