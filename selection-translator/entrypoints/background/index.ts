import { sendMessage } from "../utils/messaging";

// WXTでは、拡張機能のAPI「chrome」のかわりに「browser」型安全を使用用
export default defineBackground(() => {
  // Service Workerインストール時の処理
  browser.runtime.onInstalled.addListener(async () => {
    setupContextMenu();
    await aiModelDownload();
  });
  // ContextMenuクリック時の処理
  browser.contextMenus.onClicked.addListener(async (event: Browser.contextMenus.OnClickData) => {
    await onContextMenuClick(event);
  });
});

// ContextMenuセットアップ
function setupContextMenu() {
  browser.contextMenus.create({
    title: 'imageクリック時に表示',
    contexts: ['image'],
    id: 'image',
  });
}

// Service Workerで事前せい生成AIのModelをダウンロード
async function aiModelDownload() {
  // Translatorのダウンロード
  const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ja',
    monitor(m) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`Translator Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  translator.destroy();

  // LanguageDetectorのダウンロード
  const detector = await LanguageDetector.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`LanguageDetector Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  detector.destroy();
}

// ContextMenuクリック時の処理
function onContextMenuClick(info: Browser.contextMenus.OnClickData) {
  if (info.mediaType === 'image' && info.srcUrl !== undefined) {
    const imageUrl = info.srcUrl;
    console.log(`${imageUrl}`);
    // content.js に imageUrlを渡す
    sendMessage('imageFromContextMenu', imageUrl);
  }
}
