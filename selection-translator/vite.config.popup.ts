import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import fs from 'fs';

const outputDir = "selection-translator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
        // index.html を popup.html にリネームするための処理
    {
      name: "rename-html",
      closeBundle() {
        const oldPath = path.resolve(outputDir, "index.html");
        const newPath = path.resolve(outputDir, "sidepanel.html");
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          console.log("index.html >> sidepanel.html にリネームしました");
        }
      }
    }
  ],
  build: {
    lib: {
      entry: 'src/popup/main.tsx',
      name: 'popup',
      fileName: 'popup',
      formats: ['iife'] // 単一ファイル出力
    },
    rollupOptions: {
      output: {
        entryFileNames: 'popup/popup.js',
      }
    },
    outDir: 'selection-translator',
    emptyOutDir: false,
  }
})
