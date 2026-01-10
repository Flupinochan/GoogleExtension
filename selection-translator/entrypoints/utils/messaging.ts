/**
 * 未使用
 */
// Service WorkerのContextMenuで取得した画像URLをContent.jsへ渡すMessaging定義
// https://wxt.dev/guide/essentials/messaging.html#messaging
import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  imageFromContextMenu(imageUrl: string): void;
  domSelectorEnabled(enabled: boolean): void;
  allTranslation(): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
