import { err, ok, type Result } from "neverthrow";
import { languageStorage } from "@/entrypoints/utils/storage";
import type { Failure } from "@/types";

/**
 * LanguageDetectorで入力文字列の言語を判定
 */
export async function detectLanguage(
  text: string,
): Promise<Result<string, Failure>> {
  let detector: LanguageDetector | undefined;
  try {
    detector = await LanguageDetector.create();
    const detectedLanguages = await detector.detect(text);
    if (detectedLanguages[0].detectedLanguage === undefined) {
      return err({
        message: "Language could not be detected",
      } satisfies Failure);
    }
    return ok(detectedLanguages[0].detectedLanguage);
  } catch (error) {
    return err({
      message: `Language detection failed: ${String(error)}`,
    } satisfies Failure);
  } finally {
    if (detector) detector.destroy();
  }
}

/**
 * Translate APIでストリーミング翻訳
 */
export async function* translateStreaming(
  text: string,
): AsyncIterable<Result<string, Failure>> {
  let translator: Translator | undefined;
  try {
    const sourceLanguage = await detectLanguage(text);
    if (sourceLanguage.isErr()) {
      yield err({
        message: sourceLanguage.error.message,
      } satisfies Failure);
      return;
    }

    translator = await Translator.create({
      sourceLanguage: sourceLanguage.value,
      targetLanguage: await languageStorage.getValue(),
    });

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
      message: `Failed to translate: ${String(error)}`,
    } satisfies Failure);
  }
}
