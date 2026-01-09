"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

type Language = 'en' | 'am' | 'om' | 'so' | 'ti';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider - Now bridged to next-intl for all translations.
 * The hardcoded dictionary has been removed in favor of messages/*.json files.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Language;
  const t_intl = useTranslations();
  const [language, setLanguageState] = useState<Language>(locale || 'en');

  useEffect(() => {
    // Keep local language state in sync with next-intl locale
    if (locale) {
      setLanguageState(locale);
    }
  }, [locale]);

  const setLanguage = (lang: Language) => {
    // Note: Language switching is primarily handled by URL navigation in next-intl.
    // This state is kept for backward compatibility with components using useLanguage().
    setLanguageState(lang);
  };

  /**
   * t - Bridge function that delegates to next-intl's useTranslations.
   * This allowed us to remove 2000+ lines of hardcoded strings.
   */
  const t = (key: string): string => {
    try {
      // Use next-intl for the actual lookup
      return t_intl(key as any);
    } catch (e) {
      // Fallback to the key itself if translation fails
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
