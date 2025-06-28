// 翻訳した文字表示するするポップアップを制御するファイル
import { selectedData } from "./selectionManager";

export const POPUP_ID = "selection-translate-popup";

/**
 * ポップアップ要素を作成、表示
 */
export function displayPopup(selectedData: selectedData): HTMLDivElement {
  // 既存のポップアップがあれば削除
  const existingPopup = document.getElementById(POPUP_ID);
  if (existingPopup)
    existingPopup.remove();

  // 選択された位置を取得
  const rect = selectedData.selectedRange.getBoundingClientRect();

  // ポップアップ要素を設定
  const popup = document.createElement('div');
  popup.id = POPUP_ID;
  popup.textContent = "Translating..."; // 初期テキスト
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

  // ポップアップ要素を追加
  document.body.appendChild(popup);

  // ポップアップ範囲外がクリックされた場合にポップアップを削除するEventListenerを設定
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (target && popup.parentNode && !popup.contains(target)) {
      popup.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);

  return popup;
}

export function updatePopup(popup: HTMLDivElement, text: string) {
  popup.textContent = text;
}