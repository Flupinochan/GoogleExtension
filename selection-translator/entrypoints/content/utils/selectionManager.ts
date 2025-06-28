import { Failure } from "@/entrypoints/utils/interfaces";
import { err, ok, Result } from "neverthrow";
import { POPUP_ID } from "./uiManager";

export interface selectedData {
  selectedText: string; // 選択した文字列
  selectedCount: number; // 選択した文字数
  selectedRange: Range; // 選択したDOM位置
}

/**
 * Selection APIで選択されたデータを返却
 */
export async function getSelectionData(): Promise<Result<selectedData, Failure>> {
  // 1文字以上選択されていなければエラー
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return err({ code: 1, message: "1文字も選択されていません" });
  }

  // 翻訳結果を表示するポップアップ要素divがSelectionされていればエラー
  // ※ポップアップ要素翻訳しないためため
  const range = selection.getRangeAt(0);
  const popup = document.getElementById(POPUP_ID);
  if (popup && (popup.contains(range.startContainer) || popup.contains(range.endContainer))) {
    return err({ code: 1, message: "ポップアップ要素は翻訳しません" });
  }

  return ok({
    selectedText: selection.toString(),
    selectedCount: selection.rangeCount,
    selectedRange: selection.getRangeAt(0),
  });
}
