import { err, ok, Result } from "neverthrow";
import { Failure } from "../utils/interfaces";
import { availableStorage } from "../utils/local-storage";

/**
 * WXTでは、拡張機能のAPI「chrome」のかわりに「browser」型安全を使用
 */
export default defineBackground(() => {
  // Service Workerインストール時の処理
  browser.runtime.onInstalled.addListener(async () => {
    const result = await aiModelDownload();
    // ダウンロード結果をlocal storageに保存
    // popup.html から利用状態を取得
    if (result.isOk()) {
      await availableStorage.setValue("available");
    } else {
      await availableStorage.setValue("unavailable");
      console.log(result.error.message);
    }
  });
});

/**
 * 事前に生成AIのModelをダウンロード
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
    if (translator)
      translator.destroy();
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
    if (detector)
      detector.destroy();
  }

  return ok(undefined);
}
