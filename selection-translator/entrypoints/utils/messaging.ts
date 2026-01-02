/**
 * 未使用
 */
// Service WorkerのContextMenuで取得した画像URLをContent.jsへ渡すMessaging定義
// https://webext-core.aklinker1.io/messaging/installation/
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  imageFromContextMenu(imageUrl: string): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
