import { retryPolicy } from "@/entrypoints/utils/retry";
import { targetLangStorage } from "@/entrypoints/utils/storage";
import { Failure } from "@/types";
import { err, ok, type Result } from "neverthrow";

/**
 * LanguageDetectorで入力文字列の言語を判定
 * 翻訳先はpopup.htmlで選択した言語
 * @param text 言語判定する文字列
 * @returns 判定された言語コード
 */
async function detectLanguage(text: string): Promise<Result<string, void>> {
  let detector: LanguageDetector | undefined;
  try {
    detector = await LanguageDetector.create();
    const detectedLanguages = await detector.detect(text);
    if (detectedLanguages[0].detectedLanguage === undefined) {
      return err();
    }
    return ok(detectedLanguages[0].detectedLanguage);
  } catch (error) {
    console.error(`language detection failed: ${String(error)}`);
    return err();
  } finally {
    if (detector) detector.destroy();
  }
}

/**
 * Translate APIでストリーミング翻訳
 * @param text 翻訳する文字列
 * @returns 翻訳結果文字列の非同期イテレータ
 */
export async function* translateStreaming(
  text: string
): AsyncIterable<Result<string, Failure>> {
  let translator: Translator | undefined;
  try {
    const detectLang = await detectLanguage(text);
    const sourceLang = detectLang.isOk()
      ? detectLang.value
      : document.documentElement.lang;

    const targetLang =
      (await targetLangStorage.getValue()) ??
      (await browser.i18n.getAcceptLanguages())[0];

    translator = await retryPolicy.execute(() =>
      Translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      })
    );

    try {
      const stream = translator.translateStreaming(text);
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield ok(value);
        }
      } finally {
        reader.releaseLock();
      }
    } finally {
      if (translator) translator.destroy();
    }
  } catch (error) {
    yield err({
      type: "translation_failed",
      message: `Translation failed: ${String(error)}`,
    } satisfies Failure);
  }
}
