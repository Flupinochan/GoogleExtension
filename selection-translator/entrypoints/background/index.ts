import { err, ok, Result } from "neverthrow";
import { Failure } from "../utils/interfaces";
import { availableStorage } from "../utils/local-storage";
// import { sendMessage } from "../utils/messaging";

// WXTでは、拡張機能のAPI「chrome」のかわりに「browser」型安全を使用用
export default defineBackground(() => {
  // Service Workerインストール時の処理
  browser.runtime.onInstalled.addListener(async () => {
    // setupContextMenu();
    const result = await aiModelDownload();
    if (result.isOk())
      await availableStorage.setValue("available");
    else
      await availableStorage.setValue("unavailable");
  });
  // // ContextMenuクリック時の処理
  // browser.contextMenus.onClicked.addListener((info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) => {
  //   onContextMenuClick(info, tab);
  // });
});

// // ContextMenuセットアップ
// function setupContextMenu() {
//   browser.contextMenus.create({
//     title: 'imageクリック時に表示',
//     contexts: ['image'],
//     id: 'image',
//   });
// }

/**
 * 事前に生成AIのModelをダウンロード
 * @returns {Promise<Result<void, Failure>>}
 */
async function aiModelDownload(): Promise<Result<void, Failure>> {
  // Translatorのダウンロード
  let translator: Translator | undefined = undefined;
  try {
    translator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage: 'ja',
      monitor(m) {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`Translator Downloaded ${e.loaded * 100}%`);
        });
      },
    });
  } catch (error) {
    return err({ code: 1, message: "Translator APIでダウンロードに失敗しました" });
  } finally {
    if (translator) {
      translator.destroy();
    }
  }

  // LanguageDetectorのダウンロード
  let detector: LanguageDetector | undefined = undefined;
  try {
    detector = await LanguageDetector.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e: any) => {
          console.log(`LanguageDetector Downloaded ${e.loaded * 100}%`);
        });
      },
    });
  } catch (error) {
    return err({ code: 1, message: "LanguageDetector APIでダウンロードに失敗しました" });
  } finally {
    if (detector) {
      detector.destroy();
    }
  }

  // // Promptのダウンロード (音声モデルはまだβ版のみ)
  // const availability = await LanguageModel.availability({
  //   expectedInputs: [
  //     { type: "image" },
  //   ]
  // });
  // console.log(availability);
  // const model = await LanguageModel.create({
  //   expectedInputs: [{ type: "image" }],
  //   monitor(m) {
  //     m.addEventListener("downloadprogress", (e) => {
  //       console.log(`LanguageModel Downloaded ${e.loaded * 100}%`);
  //     });
  //   },
  // });
  // model.destroy();

  return ok(undefined);
}

// // ContextMenuクリック時の処理
// async function onContextMenuClick(info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) {
//   const mediaType = info.mediaType;
//   const imageUrl = info.srcUrl;
//   const tabId = tab?.id;
//   const frameId = info.frameId;
//   if (mediaType === 'image' && imageUrl !== undefined && tabId !== undefined) {
//     console.log(`${imageUrl}`);
//     const result = await transcribeFromImage(imageUrl);
//     if (result.isErr()) {
//       console.log(result.error.message);
//       return;
//     }
//     // content.js に画像の文字お越し結果を送信
//     sendMessage('imageFromContextMenu', result.value, { tabId, frameId });
//   }
// }

// // 画像文字お越し ※現在、PromptAPIはbackground.jsでしか使用できないため
// async function transcribeFromImage(imageData: string): Promise<Result<string, Failure>> {
//   let blob;
//   try {
//     // imageUrl(string)からBlobデータを取得
//     const response = await fetch(imageData);
//     if (!response.ok)
//       throw new Error(`HTTP error! status: ${response.status}`);
//     blob = await response.blob();
//   } catch (error) {
//     return err({ code: 1, message: "画像取得エラー" });
//   }

//   const session = await LanguageModel.create({
//     expectedInputs: [
//       { type: "text" },
//       { type: "image" },
//     ],
//     initialPrompts: [{
//       role: "system",
//       content: "あなたは生成AIアシスタントです。"
//     }]
//   });

//   try {
//     const result = await session.prompt([{
//       role: "user", content: [
//         { type: "text", value: "画像の内容を文字お越ししてください。出力内容は文字お越しした結果だけで良いです。" },
//         { type: "image", value: blob },
//       ]
//     }]);
//     return ok(result);
//   } catch (error) {
//     return err({ code: 1, message: `Prompt API リクエストエラー: ${error}` });
//   } finally {
//     session.destroy();
//   }
// }
