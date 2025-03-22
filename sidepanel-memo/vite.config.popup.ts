import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from "fs";

const outputDir = "sidepanel-memo/sidepanel";

export default defineConfig({
  plugins: [
    react(),
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "",
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 出力されるhtml、css、javascript等のファイルをoutDir直下に出力 (デフォルトでは、"assets/[name].[ext]")
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      }
    }
  },

})
