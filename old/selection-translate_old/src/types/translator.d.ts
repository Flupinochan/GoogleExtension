// Translator APIの型定義
// https://developer.mozilla.org/en-US/docs/Web/API/Translator
export declare global {
  class Translator {
    static create(options: {
      sourceLanguage: string;
      targetLanguage: string;
    }): Promise<Translator>;

    static availability(options: {
      sourceLanguage: string;
      targetLanguage: string;
    }): Promise<string>;

    translate(input: string): Promise<string>;

    translateStreaming(input: string): ReadableStream;

    destroy();
  }
}
