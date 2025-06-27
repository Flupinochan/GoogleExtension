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


async function runTranslate(message) {
  // 初期化
  const translator = await self.ai.translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ja',
  });

  // 翻訳
  const result = await translator.translate(message);
  return result;
}



async function summarizeText(longText) {
  const options = {
    type: 'tl;dr',
    format: 'plain-text',
    length: 'short',
  };

  // Modelのダウンロード
  const available = (await self.ai.summarizer.capabilities()).available;
  let summarizer;

  if (available === 'no') {
    // The Summarizer API isn't usable.
    console.log("Summarizer API is not available.");
    return;
  }

  if (available === 'readily') {
    // The Summarizer API can be used immediately.
    summarizer = await self.ai.summarizer.create(options);
  } else {
    // The Summarizer API can be used after the model is downloaded.
    summarizer = await self.ai.summarizer.create(options);
    summarizer.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
    });
    await summarizer.ready;
  }

  // 要約の生成
  const result = await summarizer.summarize(longText);
  return result;
}



async function runPrompt(message) {
  // セッション初期化
  const session = await ai.languageModel.create({
    systemPrompt: 'You are an excellent assistant. Please explain the given content in detail.',
  });

  // プロンプト実行
  const result = await session.prompt(message);

  return result;
}
