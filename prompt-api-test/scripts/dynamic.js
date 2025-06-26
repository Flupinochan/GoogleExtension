// マウスの押下と離すイベントを監視
let isMouseDown = false;

document.addEventListener('mousedown', (event) => {
  isMouseDown = true;
});

document.addEventListener('mouseup', async () => {
  if (isMouseDown) {
    // 選択されたテキストを取得
    const selection = window.getSelection().toString();
    if (selection) {
      console.log("【選択したテキスト】");
      console.log(selection);

      console.log("【チャット】");
      const aiMessage = await runPrompt(selection);
      console.log(aiMessage);

      console.log("【翻訳】");
      const translatedMessage = await runTranslate(aiMessage);
      console.log(translatedMessage);

      console.log("【要約】");
      const summaryMessage = await summarizeText(aiMessage);
      const summaryTranslatedMessage = await runTranslate(summaryMessage);
      console.log(summaryTranslatedMessage);
    }
    isMouseDown = false;
  }
});

// 翻訳処理
async function runTranslate(message) {
  console.log("📝 翻訳APIを呼び出し中...");
  const translator = await self.ai.translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ja',
  });

  const result = await translator.translate(message);
  return result;
}

// 要約処理
async function summarizeText(longText) {
  console.log("📖 要約APIを呼び出し中...");
  const options = {
    type: 'tl;dr',
    format: 'plain-text',
    length: 'short',
  };

  const available = (await self.ai.summarizer.capabilities()).available;
  let summarizer;

  if (available === 'no') {
    console.log("Summarizer API is not available.");
    return;
  }

  if (available === 'readily') {
    summarizer = await self.ai.summarizer.create(options);
  } else {
    summarizer = await self.ai.summarizer.create(options);
    summarizer.addEventListener('downloadprogress', (e) => {
      console.log(`ダウンロード中: ${e.loaded} / ${e.total} bytes`);
    });
    await summarizer.ready;
  }

  const result = await summarizer.summarize(longText);
  return result;
}

// AI チャット処理
async function runPrompt(message) {
  console.log("🤖 AI チャットAPIを呼び出し中...");
  const session = await ai.languageModel.create({
    systemPrompt: 'You are an excellent assistant. Please explain the given content in detail.',
  });

  const result = await session.prompt(message);
  return result;
}
