// 生成AI Modelのダウンロード表示
// const session = await chrome.aiOriginTrial.languageModel.create({
//   monitor(m) {
//     m.addEventListener("downloadprogress", (e) => {
//       console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
//     });
//   },
// });

// セッションのカスタマイズ
// const slightlyHighTemperatureSession = await chrome.aiOriginTrial.languageModel.create({
//   temperature: Math.max(capabilities.defaultTemperature * 1.2, 2.0),
//   topK: capabilities.defaultTopK,
// });

// チャット履歴
// const session = await chrome.aiOriginTrial.languageModel.create({
//   initialPrompts: [
//     { role: 'system', content: 'You are a helpful and friendly assistant.' },
//     { role: 'user', content: 'What is the capital of Italy?' },
//     { role: 'assistant', content: 'The capital of Italy is Rome.'},
//     { role: 'user', content: 'What language is spoken there?' },
//     { role: 'assistant', content: 'The official language of Italy is Italian. [...]' }
//   ]
// });

/////////////////////
/// 生成AIチャット ///
/////////////////////
// ※非日本語対応
async function runPrompt() {
  // セッション初期化
  const session = await chrome.aiOriginTrial.languageModel.create({
    systemPrompt: 'You are helpful assistant.',
  });

  // プロンプト実行
  const message = await session.prompt('Please teach me client side AI');
  console.log(message);
}

// 非同期関数を呼び出し
runPrompt().catch((error) => console.error('エラー:', error));


//////////////////////////
/// 英語から日本語に翻訳 ///
//////////////////////////
async function runTranslate() {
  // 初期化
  const translator = await self.ai.translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ja',
  });

  // 翻訳
  const result = await translator.translate('Gemini 1.0 Nano Our most efficient model for on-device tasks 1.0 Nano is optimized for providing quick responses, on-device — with or without a data network.');
  console.log(result);
}

runTranslate().catch((error) => console.error('エラー:', error));

// https://github.com/webmachinelearning/prompt-api

////////////
/// 要約 ///
////////////
async function summarizeText(longText) {
  const options = {
    sharedContext: 'This is a scientific article',
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
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
  console.log(result);
}
