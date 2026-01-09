/**
 * Internationalization Types
 * Supports 5 languages: English, Amharic, Oromo, Tigrinya, Somali
 */

export type Language = 'en' | 'am' | 'om' | 'ti' | 'so';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇬🇧',
  },
  am: {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    direction: 'ltr',
    flag: '🇪🇹',
  },
  om: {
    code: 'om',
    name: 'Oromo',
    nativeName: 'Afaan Oromoo',
    direction: 'ltr',
    flag: '🇪🇹',
  },
  ti: {
    code: 'ti',
    name: 'Tigrinya',
    nativeName: 'ትግርኛ',
    direction: 'ltr',
    flag: '🇪🇹',
  },
  so: {
    code: 'so',
    name: 'Somali',
    nativeName: 'Soomaali',
    direction: 'ltr',
    flag: '🇸🇴',
  },
};

export type TranslationKey = string;
export type Translations = Record<TranslationKey, string>;
