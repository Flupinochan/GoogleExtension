import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/scripts/script.ts',
      name: 'MyScript',
      fileName: 'script',
      formats: ['iife'] // 単一ファイル出力
    },
    rollupOptions: {
      output: {
        entryFileNames: 'scripts/script.js',
      }
    },
    outDir: 'selection-translator',
    emptyOutDir: false,
  }
});