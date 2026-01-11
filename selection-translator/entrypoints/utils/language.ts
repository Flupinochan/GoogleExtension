import { retryPolicy } from "./retry";
import { LANGUAGES, LanguageCode } from "./storage";

const DEFAULT_SOURCE_LANGUAGE: LanguageCode = "en";
const DEFAULT_TARGET_LANGUAGE: LanguageCode = "ja";

/**
 * ja-JP -> ja
 */
function normalizeLanguageCode(
  langCode: string | undefined | null
): string | null {
  if (!langCode) return null;
  return langCode.split("-")[0].toLowerCase();
}

function isValidLanguageCode(code: string | null): code is LanguageCode {
  if (!code) return false;
  return LANGUAGES.some((lang) => lang.code === code);
}

export function getDefaultSourceLang(): LanguageCode {
  // <html lang="xx">
  const htmlLang = normalizeLanguageCode(document.documentElement.lang);
  if (isValidLanguageCode(htmlLang)) {
    return htmlLang;
  }

  return DEFAULT_SOURCE_LANGUAGE;
}

export async function getDefaultTargetLang(): Promise<LanguageCode> {
  try {
    // browser setting language
    const userLangs = await retryPolicy.execute(() =>
      browser.i18n.getAcceptLanguages()
    );
    if (userLangs.length > 0) {
      const normalized = normalizeLanguageCode(userLangs[0]);
      if (isValidLanguageCode(normalized)) {
        return normalized;
      }
    }
  } catch (_error) {
    return DEFAULT_TARGET_LANGUAGE;
  }

  return DEFAULT_TARGET_LANGUAGE;
}
