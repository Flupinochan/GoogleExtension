import { createRoot, Root } from 'react-dom/client';
import { selectedData } from "./selectionManager";
import { TranslationPopup } from '../components/TranslationPopup';

export const POPUP_ID = "selection-translate-popup";

let currentRoot: Root | null = null;
let currentContainer: HTMLDivElement | null = null;

/**
 * ポップアップ要素を作成、表示
 */
export function displayPopup(selectedData: selectedData): {
  update: (text: string) => void;
  close: () => void;
} {
  // 既存のポップアップがあれば削除
  closePopup();

  // 選択された位置を取得
  const rect = selectedData.selectedRange.getBoundingClientRect();
  const position = {
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 8
  };

  // Reactコンポーネント用のコンテナを作成
  const container = document.createElement('div');
  container.id = POPUP_ID;
  document.body.appendChild(container);

  currentContainer = container;
  currentRoot = createRoot(container);

  let currentText = "Translating...";

  const renderPopup = (text: string) => {
    if (currentRoot) {
      currentRoot.render(
        <TranslationPopup
          text={text}
          position={position}
          onClose={closePopup}
        />
      );
    }
  };

  // 初期レンダリング
  renderPopup(currentText);

  return {
    update: (text: string) => {
      currentText = text;
      renderPopup(text);
    },
    close: closePopup
  };
}

/**
 * ポップアップを閉じる
 */
function closePopup() {
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }

  if (currentContainer) {
    currentContainer.remove();
    currentContainer = null;
  }
}
