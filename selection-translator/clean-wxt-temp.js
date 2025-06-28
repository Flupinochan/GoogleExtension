const fs = require('fs');
const path = require('path');
const os = require('os');

// より確実なTempディレクトリの取得
function getTempDirectory() {
  // 複数の方法でTempディレクトリを取得を試行
  const possiblePaths = [
    os.tmpdir(),
    process.env.TEMP,
    process.env.TMP,
    path.join(os.homedir(), 'AppData', 'Local', 'Temp')
  ];

  for (const tempPath of possiblePaths) {
    if (tempPath && fs.existsSync(tempPath)) {
      console.log(`📁 Tempディレクトリを発見: ${tempPath}`);
      return tempPath;
    }
  }

  throw new Error('Tempディレクトリが見つかりません');
}

// 削除対象のパターン
const patterns = [
  /^tmp-web-ext.*$/,               // tmp-web-ext...
  /^chrome_url_fetcher.*$/,    // chrome_url_fetcher...
  /^chrome_Unpacker.*$/         // chrome_Unpacker...
];

function cleanWxtTempFolders() {
  try {
    console.log(`🧹 WXT関連Tempフォルダをクリーンアップしています...`);

    const tempDir = getTempDirectory();
    console.log(`📂 使用するTempディレクトリ: ${tempDir}`);

    // ディレクトリが存在するか確認
    if (!fs.existsSync(tempDir)) {
      console.error(`❌ ディレクトリが存在しません: ${tempDir}`);
      return;
    }

    const items = fs.readdirSync(tempDir);
    let deletedCount = 0;
    let foundCount = 0;

    console.log(`📋 検出されたアイテム数: ${items.length}`);

    items.forEach(item => {
      try {
        const itemPath = path.join(tempDir, item);

        // ファイルの存在確認
        if (!fs.existsSync(itemPath)) {
          return;
        }

        const stats = fs.statSync(itemPath);
        if (!stats.isDirectory()) return;

        const shouldDelete = patterns.some(pattern => pattern.test(item));

        if (shouldDelete) {
          foundCount++;
          console.log(`🎯 対象フォルダを発見: ${item}`);

          try {
            fs.rmSync(itemPath, { recursive: true, force: true });
            console.log(`✅ 削除完了: ${item}`);
            deletedCount++;
          } catch (deleteErr) {
            console.warn(`⚠️ 削除失敗: ${item} - ${deleteErr.message}`);
          }
        }
      } catch (itemErr) {
        // 個別のアイテムエラーは警告レベルで処理
        console.warn(`⚠️ アイテム処理エラー: ${item} - ${itemErr.message}`);
      }
    });

    console.log(`\n📊 結果:`);
    console.log(`   - 対象フォルダ発見: ${foundCount}個`);
    console.log(`   - 削除成功: ${deletedCount}個`);
    console.log(`🎉 クリーンアップ完了!`);

  } catch (err) {
    console.error('❌ Tempフォルダのクリーンアップに失敗しました:', err.message);
    console.error('🔍 詳細:', err);
    process.exit(1);
  }
}

cleanWxtTempFolders();