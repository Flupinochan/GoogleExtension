// LanguageDetector APIの型定義
// https://developer.mozilla.org/en-US/docs/Web/API/LanguageDetector
export declare global {
  interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
  }

  class LanguageDetector {
    static create(options?: {
      expectedInputLanguages?: string;
      monitor?: (monitor: CreateMonitor) => void;
    }): Promise<LanguageDetector>;

    static availability(options: {
      expectedInputLanguages: string;
    }): Promise<string>;

    destroy();

    detect(input: string): Promise<LanguageDetectionResult[]>;
  }
}
