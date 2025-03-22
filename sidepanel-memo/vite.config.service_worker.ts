import { defineConfig } from 'vite'
import path from 'path'

const outputDir = "sidepanel-memo/service_worker";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  publicDir: false, // publicフォルダを除外
  base: "", // デフォルトでは"/"であり、、ビルド後に<script>タグなどにおけるパスが絶対パスから相対パスになるようにする
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        service_worker: path.resolve(__dirname, "service_worker/service_worker.ts")
      },
      output: {
        format: "iife",
        dir: outputDir,
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      }
    }
  },

})
