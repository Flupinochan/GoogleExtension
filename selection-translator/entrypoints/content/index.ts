export default defineContentScript({
  matches: ['<all_urls>'], // すべてのURLでコンテンツスクリプトを実行
  main() {
    // DOMが読み込まれた後にイベントリスナーを設定
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeContentScript);
    } else {
      initializeContentScript();
    }
  },
});

import { Result, ok, err } from 'neverthrow';
import { languageStorage } from '../popup/App';

interface Failure {
  code: number;
  message: string;
}

/**
 * コンテンツスクリプトの初期化
 */
function initializeContentScript(): void {
  document.addEventListener("mouseup", main);
}

/**
 * メイン処理
 */
async function main() {
  const popup = createPopup();
  const selectedText = await getSelectionText();
  if (selectedText.isErr()) {
    popup.remove();
    return;
  }

  // ストリーミング翻訳を実行（ポップアップは関数内で作成・更新）
  const translatedText = await translateStreaming(selectedText.value, popup);
  if (translatedText.isErr()) {
    popup.remove();
    return;
  }
}

/**
 * Selection APIで選択されている文字列を取得
 */
async function getSelectionText(): Promise<Result<string, Failure>> {
  // 1文字以上Selectionされているかどうか
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return err({ code: 1, message: "error" });
  }

  // ポップアップ要素divがSelectionされているかどうか
  const range = selection.getRangeAt(0);
  const popup = document.querySelector('.selection-translate-popup');
  if (popup && (popup.contains(range.startContainer) || popup.contains(range.endContainer))) {
    return err({ code: 1, message: "error" });
  }

  return ok(selection.toString());
}

/**
 * 入力文字列の言語を判定
 */
async function detectLanguage(text: string): Promise<Result<string, Failure>> {
  const detector = await LanguageDetector.create();
  try {
    const detectedLanguages = await detector.detect(text);
    return ok(detectedLanguages[0].detectedLanguage);
  } catch (error) {
    return err({ code: 2, message: "error" });
  } finally {
    detector.destroy();
  }
}

/**
 * Translate APIでストリーミング翻訳
 */
async function translateStreaming(text: string, popup: HTMLDivElement): Promise<Result<string, Failure>> {
  const sourceLanguage = await detectLanguage(text);
  if (sourceLanguage.isErr())
    return err({ code: 2, message: "error" });

  const saved = await languageStorage.getValue();

  const translator = await Translator.create({
    sourceLanguage: sourceLanguage.value,
    targetLanguage: saved,
  });

  try {
    const stream = translator.translateStreaming(text);
    const reader = stream.getReader();
    let translation = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        translation += value;
        updatePopupText(popup, translation);
      }
      return ok(translation);
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    return err({ code: 2, message: "error" });
  } finally {
    translator.destroy();
  }
}

/**
 * ポップアップ要素を作成
 */
function createPopup(): HTMLDivElement {
  // 既存のポップアップがあれば削除
  const existingPopup = document.querySelector('.selection-translate-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // 選択範囲の位置を取得
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    throw new Error("No selection found");
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // ポップアップ要素divを作成
  const popup = document.createElement('div');
  popup.className = 'selection-translate-popup';
  popup.textContent = "翻訳中..."; // 初期表示

  // ポップアップのスタイルを設定
  popup.style.cssText = `
    position: absolute;
    left: ${rect.left + window.scrollX}px;
    top: ${rect.bottom + window.scrollY + 5}px;
    z-index: 10000;
    background: linear-gradient(135deg, rgba(255, 75, 75, 0.3), rgba(75, 150, 255, 0.3));
    backdrop-filter: blur(15px) saturate(180%);
    -webkit-backdrop-filter: blur(15px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 14px;
    max-width: 300px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                0 0 20px rgba(255, 255, 255, 0.1) inset;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  `;

  document.body.appendChild(popup);
  setupClickOutsideHandler(popup);

  return popup;
}

/**
 * ポップアップのテキストを更新
 */
function updatePopupText(popup: HTMLDivElement, text: string): void {
  popup.textContent = text;
}

/**
 * ポップアップ外クリック処理を設定
 */
function setupClickOutsideHandler(popup: HTMLDivElement): void {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!popup.contains(target)) {
      popup.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  };

  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
}