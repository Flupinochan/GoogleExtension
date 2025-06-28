// Service WorkerのContextMenuで取得した画像URLを
// Content.jsへ渡すMessaging定義
import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  imageFromContextMenu(imageUrl: string): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();