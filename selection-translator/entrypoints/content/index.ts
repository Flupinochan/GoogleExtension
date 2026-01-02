import type { ContentScriptContext } from "#imports";
import { enabledStorage } from "../utils/storage";
import { displayTranslationPopup } from "./components/translationPopupManager";
import { getSelectionData } from "./services/selection";
import { translateStreaming } from "./services/translation";

export default defineContentScript({
  matches: ["<all_urls>"],
  main(_ctx: ContentScriptContext) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeContentScript);
    } else {
      initializeContentScript();
    }
  },
});

/**
 * コンテンツスクリプトの初期化
 */
function initializeContentScript() {
  // mouseDown時にSelectionした文字列を消去
  // 1. 青線で選択
  // 2. 他の部分をクリックして青線を消す
  // 3. 1で選択した青線が取得され翻訳されてしまうため
  // ※mouseUpした際に青線が消えるため
  document.addEventListener("mousedown", (_event) => {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  });
  document.addEventListener("mouseup", mainProcess);
}

/**
 * メイン処理
 */
async function mainProcess() {
  const enabled = await enabledStorage.getValue();
  if (!enabled) {
    return;
  }

  const selectedDataResult = await getSelectionData();
  if (selectedDataResult.isErr()) {
    console.log(selectedDataResult.error.message);
    return;
  }
  const selectedData = selectedDataResult.value;

  const popup = displayTranslationPopup(selectedData);

  let translatedText = "";
  for await (const result of translateStreaming(selectedData.selectedText)) {
    if (result.isOk()) {
      translatedText += result.value;
      popup.update(translatedText);
    } else {
      popup.update(`Error: ${result.error.message}`);
      break;
    }
  }
}
