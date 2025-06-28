import { ContentScriptContext } from '#imports';
import { getSelectionData } from './utils/selectionManager';
import { displayPopup } from './utils/uiManager';
import { translateStreaming } from './ai/text';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx: ContentScriptContext) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeContentScript);
    } else {
      initializeContentScript();
    }
  },
});

/**
 * コンテンツスクリプトの初期化
 */
function initializeContentScript() {
  document.addEventListener("mouseup", mainProcess);
}

/**
 * メイン処理
 */
async function mainProcess() {
  const selectedDataResult = await getSelectionData();
  if (selectedDataResult.isErr()) {
    console.log(selectedDataResult.error.message);
    return;
  }
  const selectedData = selectedDataResult.value;

  const popup = displayPopup(selectedData);

  let translatedText = "";
  for await (const result of translateStreaming(selectedData.selectedText)) {
    if (result.isOk()) {
      translatedText += result.value;
      popup.update(translatedText);
    } else {
      popup.update("Error: " + result.error.message);
      break;
    }
  }
}
