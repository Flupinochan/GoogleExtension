import { getFromStorage, setToStorage } from '@/utils/storage';

// HTMLが読み込まれた際に実行
document.addEventListener("DOMContentLoaded", async () => {
  // 拡張機能の状態をchrome.storage.localから取得
  const isExtensionOn = await getFromStorage<boolean>("isExtensionOn");
  const toggleCheckbox = document.getElementById("toggle") as HTMLInputElement;

  if (isExtensionOn === undefined) {
    // console.log("拡張機能がOFFです。");
    toggleCheckbox.checked = true;
    // console.log("拡張機能をONにしました。");

  } else if (isExtensionOn) {
    toggleCheckbox.checked = isExtensionOn;
    // console.log("拡張機能がONです。");

  } else {
    toggleCheckbox.checked = isExtensionOn;
    // console.log("拡張機能がOFFです。");
  }

  // ON/OFFが変更されたときのListener
  toggleCheckbox.addEventListener("change", async () => {
    // ON/OFFの状態をchrome.storage.localに保存
    const isChecked = toggleCheckbox.checked;
    await setToStorage({ isExtensionOn: isChecked });

    // console.log(`拡張機能が${isChecked ? "ON" : "OFF"}に変更されました。`);
  });

});
