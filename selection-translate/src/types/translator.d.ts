// Translator APIの型定義
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

    translate(text: string): Promise<string>;
  }
}
