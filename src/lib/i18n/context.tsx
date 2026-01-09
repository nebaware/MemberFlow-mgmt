"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'azmera_language';
const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Validates and sanitizes language code
 * Security: Prevents injection attacks through language parameter
 */
function validateLanguage(lang: string): Language {
  const sanitized = lang.toLowerCase().trim().slice(0, 2);
  if (sanitized in SUPPORTED_LANGUAGES) {
    return sanitized as Language;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Safely retrieves language from localStorage
 * Security: Validates stored value before use
 */
function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return validateLanguage(stored);
    }
  } catch (error) {
    // Fallback to default language if localStorage fails
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Safely stores language to localStorage
 * Security: Validates before storing
 */
function storeLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  
  try {
    const validated = validateLanguage(lang);
    localStorage.setItem(STORAGE_KEY, validated);
  } catch (error) {
    // Silently fail if localStorage is not available
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage on mount
  useEffect(() => {
    const stored = getStoredLanguage();
    setLanguageState(stored);
    setIsInitialized(true);
    
    // Set HTML lang attribute for accessibility
    document.documentElement.lang = stored;
    
    // Set direction for RTL languages (if needed in future)
    const direction = SUPPORTED_LANGUAGES[stored].direction;
    document.documentElement.dir = direction;
  }, []);

  /**
   * Securely changes language
   * Security: Validates input before applying
   */
  const setLanguage = useCallback((lang: Language) => {
    const validated = validateLanguage(lang);
    setLanguageState(validated);
    storeLanguage(validated);
    
    // Update HTML attributes
    document.documentElement.lang = validated;
    document.documentElement.dir = SUPPORTED_LANGUAGES[validated].direction;
  }, []);

  /**
   * Translation function with fallback
   * Security: Sanitizes key to prevent injection
   */
  const t = useCallback((key: string, fallback?: string): string => {
    // Sanitize key - only allow alphanumeric, dots, and underscores
    const sanitizedKey = key.replace(/[^a-zA-Z0-9._]/g, '');
    
    const translation = translations[language]?.[sanitizedKey];
    
    if (translation) {
      return translation;
    }
    
    // Fallback to English if available
    if (language !== 'en') {
      const englishTranslation = translations.en?.[sanitizedKey];
      if (englishTranslation) {
        return englishTranslation;
      }
    }
    
    // Return provided fallback or the key itself
    return fallback || sanitizedKey;
  }, [language]);

  const isRTL = SUPPORTED_LANGUAGES[language].direction === 'rtl';

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
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
