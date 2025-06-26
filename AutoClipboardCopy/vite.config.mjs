import { defineConfig } from "vite";
import path from "path";

// content.js では、import/exportが利用できない
// import/exportを削除して、1つのjsファイルにビルドする必要がある

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true, // outDirを空にしてからビルドする
    rollupOptions: {
      input: {
        // npx vite build で1つずつビルドする (multi inputはサポートしていない)
        content: path.resolve(__dirname, "src/scripts/content.ts"),
        // popup: path.resolve(__dirname, "src/popup/popup.ts"),
        // service_worker: path.resolve(__dirname, "src/service_worker/service_worker.ts"),
      },
      output: {
        format: "iife", // 単一ファイルにビルドする
        entryFileNames: "[name].js", // nameはプレースフォルダーでinputファイル名(拡張子なし)に置き換わり、出力javascriptファイル名になる
        dir: "dist", // 出力先
        inlineDynamicImports: true,
      },
    },
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // `@/utils/storage.ts` のようにパスを短縮
    },
  },
});
