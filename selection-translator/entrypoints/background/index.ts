// Service Workerで事前にダウンロードしておく
export default defineBackground(async () => {
  // Translatorのダウンロード
  const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ja',
    monitor(m) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`Translator Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  translator.destroy();

  // LanguageDetectorのダウンロード
  const detector = await LanguageDetector.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e: any) => {
        console.log(`LanguageDetector Downloaded ${e.loaded * 100}%`);
      });
    },
  });
  detector.destroy();
});
