chrome.runtime.onInstalled.addListener(() => {
  // 拡張機能アイコンをクリックした際にpopup.htmlがサイドバーで開くようになる
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});