import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import fs from 'fs';

const outputDir = "selection-translator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // index.html を popup.html にリネームするための処理
    {
      name: "rename-html",
      closeBundle() {
        const oldPath = path.resolve(outputDir, "index.html");
        const newPath = path.resolve(`${outputDir}/popup`, "popup.html");
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          console.log("index.html を popup.html にリネームしました");
        }
      }
    }
  ],
  build: {
    outDir: outputDir,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'popup/[name].js',
        chunkFileNames: 'popup/[name].js',
        assetFileNames: 'popup/[name].[ext]'
      }
    }
  }
})