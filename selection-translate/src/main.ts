import { Result, ok, err } from 'neverthrow';

document.addEventListener("mouseup", main);

/**
 * メイン処理
 */
async function main() {
  const selectedText = await getSelectionText();
  if (selectedText.isErr())
    return;

  const translatedText = await translate(selectedText.value);
  if (translatedText.isErr())
    return;

  console.log(translatedText.value);
  showTextPopup(translatedText.value);
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

/**
 * テキストをポップアップ表示
 */
function showTextPopup(text: string): void {
  // 既存のポップアップがあれば削除
  const existingPopup = document.querySelector('.selection-translate-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // 選択範囲の位置を取得
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // ポップアップ要素divを作成
  const popup = document.createElement('div');
  popup.className = 'selection-translate-popup';
  popup.textContent = text;

  // ポップアップのスタイルを設定
  popup.style.cssText = `
  position: absolute;
  left: ${rect.left + window.scrollX}px;
  top: ${rect.bottom + window.scrollY + 5}px;
  z-index: 10000;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

  // ページに追加
  document.body.appendChild(popup);

  // ポップアップの外側をクリックした際の処理
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    // クリックされた要素がポップアップの外側かどうかを判定
    if (!popup.contains(target)) {
      popup.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  };

  // イベントリスナーを次のイベントループで追加
  // （現在のクリックイベントが完了してから追加することで、即座に削除されることを防ぐ）
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
}

interface Failure {
  code: number;
  message: string;
}