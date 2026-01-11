import { createRoot, type Root } from "react-dom/client";
import { TranslationPopup } from "./TranslationPopup";

export const POPUP_ID = "selection-translate-popup";

export class TranslationPopupManager {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;
  private currentText = "Translating...";
  private readonly position: { x: number; y: number };

  constructor(selectedDom: Range) {
    const rect = selectedDom.getBoundingClientRect();
    this.position = {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    };
  }

  /**
   * ポップアップを表示
   */
  display(): void {
    this.container = document.createElement("div");
    this.container.id = POPUP_ID;
    document.body.appendChild(this.container);

    this.root = createRoot(this.container);
    this.render();
  }

  /**
   * 翻訳テキストを更新
   */
  update(text: string): void {
    this.currentText = text;
    this.render();
  }

  /**
   * ポップアップを閉じる
   */
  close(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  private render(): void {
    if (this.root) {
      this.root.render(
        <TranslationPopup
          text={this.currentText}
          position={this.position}
          onClose={() => this.close()}
          isLoading={this.currentText === "Translating..."}
        />
      );
    }
  }
}
