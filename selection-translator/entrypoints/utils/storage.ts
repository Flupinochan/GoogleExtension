/**
 * Storage設定
 */
import { storage } from "#imports";

// 1.翻訳先言語設定
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "it", name: "Italiano" },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export const languageStorage = storage.defineItem<LanguageCode>(
  "local:selectedLanguage",
  {
    init: () => "ja",
  },
);

// 2.生成AI機能の利用可能状態
export const availableStorage = storage.defineItem<Availability>(
  "local:availableStatus",
  {
    init: () => "unavailable",
  },
);

// 3.拡張機能の有効/無効設定
export const enabledStorage = storage.defineItem<boolean>(
  "local:enabledStatus",
  {
    init: () => true,
  },
);
