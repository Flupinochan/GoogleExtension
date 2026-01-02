import { Failure } from "@/entrypoints/utils/interfaces";
import { languageStorage } from "@/entrypoints/utils/local-storage";
import { err, ok, Result } from "neverthrow";

/**
 * LanguageDetectorで入力文字列の言語を判定
 */
export async function detectLanguage(text: string): Promise<Result<string, Failure>> {
  let detector: LanguageDetector | undefined = undefined;
  try {
    detector = await LanguageDetector.create();
    const detectedLanguages = await detector.detect(text);
    if (detectedLanguages[0].detectedLanguage === undefined) {
      return err({ code: 2, message: "Language could not be detected" });
    }
    return ok(detectedLanguages[0].detectedLanguage);
  } catch (error) {
    return err({ code: 2, message: "Language detection failed" });
  } finally {
    if (detector)
      detector.destroy();
  }
}

/**
 * Translate APIでストリーミング翻訳
 */
export async function* translateStreaming(text: string): AsyncIterable<Result<string, Failure>> {
  let translator: Translator | undefined = undefined;
  try {
    const sourceLanguage = await detectLanguage(text);
    if (sourceLanguage.isErr()) {
      yield err({ code: 2, message: sourceLanguage.error.message });
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
      if (translator)
        translator.destroy();
    }
  } catch (error) {
    yield err({ code: 2, message: "Failed to translate" });
  }
}
