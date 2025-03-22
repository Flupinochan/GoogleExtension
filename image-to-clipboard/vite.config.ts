import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { glob } from 'glob';

// エントリーポイントを自動的に作成する関数
type EntryPoints = {
  [key: string]: string;
};

const generateEntryPoints = (dirPath: string): EntryPoints => {
  return glob.sync(dirPath).reduce((entries: EntryPoints, file: string) => {
    const name = path.basename(file, path.extname(file));
    entries[name] = file;
    return entries;
  }, {});
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        // ...generateEntryPoints('src/popup/*'),
        // ...generateEntryPoints('src/content/*'),
        ...generateEntryPoints('src/service_worker/*'),
      },
      output: {
        format: 'iife',
        dir: "image-to-clipboard",
        entryFileNames: '[name]/[name].js', // JavaScriptの出力先
        assetFileNames: '[name]/[name].[ext]', // HTML、Imageなどの静的コンテンツの出力先
      },
    },
  },
})
