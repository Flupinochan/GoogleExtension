import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'MyScript',
      fileName: 'script',
      formats: ['iife'] // 単一ファイル出力
    },
    rollupOptions: {
      output: {
        entryFileNames: 'scripts/main.js',
      }
    },
    outDir: 'selection-translate',
    emptyOutDir: false,
  }
});