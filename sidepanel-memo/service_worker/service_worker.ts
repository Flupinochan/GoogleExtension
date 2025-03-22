// 拡張機能アイコンをクリックした際にpopup.htmlがサイドパネルで開くようにする設定
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log("SidePanel設定完了");
});