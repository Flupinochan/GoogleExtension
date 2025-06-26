import { getFromStorage, setToStorage } from '@/utils/storage';

// 拡張機能インストール時に実行されるListener
chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === "install") {
    // ONに設定
    try {
      await setToStorage({ isExtensionOn: true });
      // console.log("拡張機能がインストールされました。初期状態はONです。");
      const result = await getFromStorage<Boolean>("isExtensionOn");
      // console.log(result);
    } catch (error) {
      // console.log(error);
    }
  }
});
