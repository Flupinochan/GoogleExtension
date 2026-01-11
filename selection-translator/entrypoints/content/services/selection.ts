import type { Failure } from "@/types";
import { err, ok, type Result } from "neverthrow";
import { POPUP_ID } from "../components/TranslationPopupManager";

export interface SelectedData {
  text: string; // 選択した文字列
  count: number; // 選択した文字数
  dom: Range; // 選択したDOM位置
}

/**
 * Selection APIで選択されたデータを返却
 */
export function getSelectionData(): Result<SelectedData, Failure> {
  // 1文字以上選択されていなければエラー
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return err({
      type: "text_selection_failed",
      message: "テキストが選択されていません",
    } satisfies Failure);
  }

  // 翻訳結果を表示するポップアップ要素divがSelectionされていればエラー
  const range = selection.getRangeAt(0);
  const popup = document.getElementById(POPUP_ID);
  if (
    popup &&
    (popup.contains(range.startContainer) || popup.contains(range.endContainer))
  ) {
    return err({
      type: "popup_selected",
      message: "ポップアップ要素は翻訳しません",
    } satisfies Failure);
  }

  return ok({
    text: selection.toString(),
    count: selection.rangeCount,
    dom: selection.getRangeAt(0),
  });
}
