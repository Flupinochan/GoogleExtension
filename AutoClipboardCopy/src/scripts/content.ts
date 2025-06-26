// content.jsは、ブラウザに挿入されるため、直接export/importができない
// viteやwebpackで何とかする
import { getFromStorage, setToStorage } from '@/utils/storage';

/////////////////////////
/// Event Lisnter設定 ///
/////////////////////////
// 通常はマウスは押されていない
let isMouseDown: boolean = false;

// マウスが押されたときのListener
document.addEventListener("mousedown", (event: MouseEvent): void => {
  isMouseDown = true;
});

// マウスが離れたときのListener
document.addEventListener("mouseup", async (event: MouseEvent): Promise<void> => {
  // ON/OFFの取得
  const isExtensionOn = await getFromStorage<boolean>("isExtensionOn");

  if (isExtensionOn === undefined) {
    // console.log("拡張機能の状態が保存されていません。");
    await setToStorage({ isExtensionOn: true });
    // console.log("拡張機能をONにしました。");

  } else if (isExtensionOn) {
    // console.log("拡張機能はONです。");

  } else {
    // console.log("拡張機能はOFFです。");
    return;
  }

  if (isMouseDown) {
    // 選択されたテキストを取得してコピー
    const selection = window.getSelection()?.toString();

    if (selection && selection.length > 0) {
      // console.log(`【コピーしたテキスト】\n ${selection}`);
      await copyToClipboard(selection);

    } else {
      // console.log("コピー失敗");
    }

    isMouseDown = false;
  }
});


///////////////
/// 関数定義 ///
///////////////
/**
 * クリップボードにコピーする関数
 * @param text クリップボードにコピーにするテキスト
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    // クリップボードにコピー
    await navigator.clipboard.writeText(text);
    // console.log("テキストがクリップボードにコピーされました");

  } catch (error) {
    // console.error("クリップボードへのコピーに失敗しました:", error);
  }
}


////////////
/// メモ ///
////////////
// クリップボードにコピーする方法
// document.execCommand (旧APIで非推奨)
// navigator.clipboard (新Clipboard API)