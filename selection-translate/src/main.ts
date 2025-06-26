import { Result, ok, err } from 'neverthrow';

document.addEventListener("mouseup", main);

async function main() {
  const selectedText = await getSelectionText();
  if (selectedText.isErr())
    return;
  const translatedText = await translate(selectedText.value);
  console.log(translatedText);
}

/**
 * Selection APIで選択されている文字列を取得
 */
async function getSelectionText(): Promise<Result<string, Failure>> {
  const selection = window.getSelection();
  if (selection !== null && selection.rangeCount > 0 && !selection.isCollapsed)
    return ok(selection.toString());
  return err({ code: 1, message: "error" });
}

/**
 * Translate APIで翻訳
 */
async function translate(text: string): Promise<Result<string, Failure>> {
  try {
    const translator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage: 'ja',
    });
    const translatedText = await translator.translate(text);
    return ok(translatedText);
  } catch (error) {
    return err({ code: 2, message: "error" });
  }
}

interface Failure {
  code: number;
  message: string;
}
