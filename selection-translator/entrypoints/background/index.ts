import { sendMessage } from "../utils/messaging";

// WXTでは、拡張機能のAPI「chrome」のかわりに「browser」型安全を使用用
export default defineBackground(() => {
  // Service Workerインストール時の処理
  browser.runtime.onInstalled.addListener(async () => {
    setupContextMenu();
    await aiModelDownload();
  });
  // ContextMenuクリック時の処理
  browser.contextMenus.onClicked.addListener((info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) => {
    onContextMenuClick(info, tab);
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

// 事前に生成AIのModelをダウンロード
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

  // Promptのダウンロード
  const status = await LanguageModel.availability();
  console.log(status);
  const model = await LanguageModel.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        console.log(`LanguageModel Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  model.destroy();
}

// ContextMenuクリック時の処理
async function onContextMenuClick(info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) {
  const mediaType = info.mediaType;
  const imageUrl = info.srcUrl;
  const tabId = tab?.id;
  const frameId = info.frameId;
  if (mediaType === 'image' && imageUrl !== undefined && tabId !== undefined) {
    console.log(`${imageUrl}`);
    // content.js に imageUrlを送信
    const result = await transcribeFromImage(imageUrl);
    console.log(result);
    sendMessage('imageFromContextMenu', result, { tabId, frameId });
  }
}

// 画像文字お越し ※現在、PromptAPIはbackground.jsでしか使用できないため
async function transcribeFromImage(imageData: string): Promise<string> {
  const session = await LanguageModel.create({
    initialPrompts: [{
      role: "system",
      content: "You are a friendly, helpful assistant. Answer in Japanese."
    }]
  });

  const result = await session.prompt(
    "日本語で回答可能でしょうか。"
  );
  return result;
}