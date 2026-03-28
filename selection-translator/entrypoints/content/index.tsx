import type { ContentScriptContext } from "#imports";
import { createRoot } from "react-dom/client";
import { onMessage, ProtocolMap } from "../utils/messaging";
import { extensionEnabledStorage } from "../utils/storage";
import { DomSelector } from "./components/DomSelector";
import { translateTextNodes } from "./components/domTranslation";
import { TranslationPopupManager } from "./components/TranslationPopupManager";
import { getSelectionData } from "./services/selection";
import { translateImage, translateStreaming } from "./services/translation";
import { ExtensionMessage, Message } from "@webext-core/messaging";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  main(_ctx: ContentScriptContext) {
    initContentScript();
  },
});

let lastContextMenuRange: Range | undefined;

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
  // Translate Image
  document.addEventListener("contextmenu", async (event) =>
    onOpenContextMenu(event),
  );
  onMessage("imageFromContextMenu", async (message) =>
    onClickedContextMenu(message),
  );
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

async function onOpenContextMenu(event: PointerEvent) {
  const selection = window.getSelection();
  if (selection) selection.removeAllRanges();

  if (event.target instanceof HTMLImageElement) {
    const range = document.createRange();
    range.selectNode(event.target);
    lastContextMenuRange = range;
  } else {
    lastContextMenuRange = undefined;
  }
}

async function onClickedContextMenu(
  message: Message<ProtocolMap, "imageFromContextMenu"> & ExtensionMessage,
) {
  const imageUrl = message.data;
  console.log("Received image URL from context menu:", imageUrl);
  const selectedRange = lastContextMenuRange ?? new Range();

  const popup = new TranslationPopupManager(selectedRange);
  popup.display();

  let translatedText = "";
  for await (const result of translateImage(imageUrl)) {
    if (result.isOk()) {
      translatedText += result.value;
      popup.update(translatedText);
    } else {
      popup.update(result.error.message);
      break;
    }
  }

  lastContextMenuRange = undefined;
}
