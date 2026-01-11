/**
 * popup or background から content script へ Messaging を送信する定義
 * 主にpopup or background から UI (dom) 操作したい場合に利用
 */
import type { Failure } from "@/types";
import { defineExtensionMessaging } from "@webext-core/messaging";
import { err, ok, type Result } from "neverthrow";
import { retryPolicy } from "./retry";

export interface ProtocolMap {
  // select image (background:context menu -> content script)
  imageFromContextMenu(imageUrl: string): void;
  // dom selector (popup -> content script)
  domSelectorEnabled(): void;
  // all translation (popup -> content script)
  allTranslation(): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();

export const sendToContentScript = async (
  action: keyof ProtocolMap,
  data: Parameters<ProtocolMap[typeof action]>[0],
  close: boolean = true
): Promise<Result<void, Failure>> => {
  try {
    // close popup.html
    if (close) window.close();

    // get active tab id
    const [tab] = await retryPolicy.execute(() =>
      browser.tabs.query({
        active: true,
        currentWindow: true,
      })
    );

    // send message to content script
    if (tab.id) {
      await retryPolicy.execute(() => sendMessage(action, data, tab.id));
    }
    return ok();
  } catch (error) {
    return err({
      type: "messaging_send_failed",
      message: `Failed to send message to content script: ${String(error)}`,
    } satisfies Failure);
  }
};
