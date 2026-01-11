import { translateStreaming } from "../services/translation";

/**
 * TextNodeを再帰的に翻訳する
 * componentではないがUI操作に関連するため、componentsフォルダに配置
 * @param rootElement 翻訳対象のDOM要素
 */
export async function translateTextNodes(
  rootElement: HTMLElement
): Promise<void> {
  const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest("pre, code, script, style")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });

  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.textContent?.trim();

    if (text) {
      node.textContent = "";
      for await (const result of translateStreaming(text)) {
        if (result.isOk()) {
          node.textContent += result.value;
        } else {
          node.textContent = text;
          break;
        }
      }
    }

    node = walker.nextNode();
  }
}
