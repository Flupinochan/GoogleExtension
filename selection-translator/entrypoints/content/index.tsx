import type { ContentScriptContext } from "#imports";
import { createRoot } from "react-dom/client";
import { onMessage } from "../utils/messaging";
import { extensionEnabledStorage } from "../utils/storage";
import { DomSelector } from "./components/DomSelector";
import { translateTextNodes } from "./components/domTranslation";
import { TranslationPopupManager } from "./components/TranslationPopupManager";
import { getSelectionData } from "./services/selection";
import { translateStreaming } from "./services/translation";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  main(_ctx: ContentScriptContext) {
    initContentScript();
  },
});

/**
 * content scriptの初期化
 */
function initContentScript() {
  // Selection Translation
  document.addEventListener("mousedown", (_event) => {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  });
  document.addEventListener("mouseup", mainProcess);

  // All Translation
  onMessage("allTranslation", async (_message) => {
    await translateTextNodes(document.body);
  });

  // DOM Translation
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<DomSelector />);
}

/**
 * メイン処理
 */
async function mainProcess() {
  if (!(await extensionEnabledStorage.getValue())) {
    return;
  }

  const selectedDataResult = getSelectionData();
  if (selectedDataResult.isErr()) {
    return;
  }

  const selectedData = selectedDataResult.value;

  const popup = new TranslationPopupManager(selectedData.dom);
  popup.display();

  let translatedText = "";
  for await (const result of translateStreaming(selectedData.text)) {
    if (result.isOk()) {
      translatedText += result.value;
      popup.update(translatedText);
    } else {
      popup.update(result.error.message);
      break;
    }
  }
}
