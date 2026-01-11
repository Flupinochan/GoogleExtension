import { err, ok, type Result } from "neverthrow";
import { getDefaultTargetLang } from "../utils/language";
import { retryPolicy } from "../utils/retry";
import {
  aiAvailableStorage,
  targetLangStorage,
  type LanguageCode,
} from "../utils/storage";

/**
 * WXTでは、拡張機能のAPI「chrome」のかわりに「browser」型安全を使用
 * 拡張機能インストール時の初期化処理
 * - LLMモデルのダウンロード
 * - 翻訳元、翻訳先のデフォルト言語設定
 *   - デフォルトの翻訳元: "en"
 *   - デフォルトの翻訳先: ブラウザの言語設定に基づく(対応言語がない場合は"ja")
 */
const DEFAULT_TARGET_LANGUAGE: LanguageCode = "ja";
const DEFAULT_SOURCE_LANGUAGE: LanguageCode = "en";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    const defaultLang = await setDefaultTargetLanguage();
    const translator = await downloadTranslator(
      defaultLang.isOk() ? defaultLang.value : DEFAULT_TARGET_LANGUAGE
    );
    await downloadLanguageDetector();

    // popup.html から利用状態を取得するために保存
    if (translator.isOk()) {
      await aiAvailableStorage.setValue("available");
    } else {
      await aiAvailableStorage.setValue("unavailable");
    }
  });
});

/**
 * デフォルトの翻訳先言語を設定
 * @returns
 */
async function setDefaultTargetLanguage(): Promise<Result<LanguageCode, void>> {
  try {
    // chromeブラウザ設定から言語設定を取得
    const targetLang = await getDefaultTargetLang();
    await retryPolicy.execute(() => targetLangStorage.setValue(targetLang));
    return ok(targetLang);
  } catch (error) {
    console.error("デフォルトの翻訳先言語の設定に失敗しました:", String(error));
    return err();
  }
}

/**
 * LanguageDetectorモデルのダウンロード
 * @returns
 */
async function downloadLanguageDetector(): Promise<Result<void, void>> {
  let detector: LanguageDetector | undefined;
  try {
    detector = await retryPolicy.execute(() =>
      LanguageDetector.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`LanguageDetector Downloaded ${e.loaded * 100}%`);
          });
        },
      })
    );
    return ok();
  } catch (error) {
    console.error(
      `LanguageDetectorモデルのダウンロードに失敗しました: ${String(error)}`
    );
    return err();
  } finally {
    if (detector) detector.destroy();
  }
}

/**
 * Translatorモデルのダウンロード
 * @returns
 */
async function downloadTranslator(
  targetLang: LanguageCode
): Promise<Result<void, void>> {
  let translator: Translator | undefined;
  try {
    translator = await retryPolicy.execute(() =>
      Translator.create({
        sourceLanguage: DEFAULT_SOURCE_LANGUAGE,
        targetLanguage: targetLang,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Translator Downloaded ${e.loaded * 100}%`);
          });
        },
      })
    );
    return ok();
  } catch (error) {
    console.error(
      `Translatorモデルのダウンロードに失敗しました: ${String(error)}`
    );
    return err();
  } finally {
    if (translator) translator.destroy();
  }
}
