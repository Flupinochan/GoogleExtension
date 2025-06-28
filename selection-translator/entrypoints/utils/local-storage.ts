// local storageに保存する設定
import { storage } from '#imports';

// 翻訳言語設定
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
] as const;
export type LanguageCode = typeof LANGUAGES[number]['code'];
export const languageStorage = storage.defineItem<LanguageCode>('local:selectedLanguage', {
  init: () => 'ja',
});

// 拡張機能の利用可能状態
export type AVAILABLE_STATUS = "unavailable" | "downloadable" | "downloading" | "available";
export const availableStorage = storage.defineItem<AVAILABLE_STATUS>('local:availableStatus', {
  init: () => 'unavailable',
});