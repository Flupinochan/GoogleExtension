// ※コールバック処理なのでPromiseでラップしなければawaitは利用できない
// https://zenn.dev/alvinvin/books/chrome_extension/viewer/chapter07

// chrome.storage.local.get を Promise 化する関数
export function getFromStorage<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[key]);
      }
    });
  });
}

// chrome.storage.local.set を Promise 化する関数
export function setToStorage(data: object): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}