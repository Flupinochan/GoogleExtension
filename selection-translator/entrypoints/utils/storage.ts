/**
 * local storage
 */
import { storage } from "#imports";

// 1.translation target language
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
export const targetLangStorage = storage.defineItem<LanguageCode>(
  "local:selectedLanguage",
  {
    init: () => "en",
  }
);

// 2.language detector API and translator API availability status
export const aiAvailableStorage = storage.defineItem<Availability>(
  "local:availableStatus",
  {
    init: () => "unavailable",
  }
);

// 3.chrome extension enabled/disabled status
export const extensionEnabledStorage = storage.defineItem<boolean>(
  "local:enabledStatus",
  {
    init: () => true,
  }
);
