/**
 * Server-Side Translation Helper
 * For use in API routes and server components
 */

import { translations } from './translations';
import type { Language } from '@/lib/types';

const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Validates and sanitizes language code
 */
function validateLanguage(lang: string): Language {
  const sanitized = lang.toLowerCase().trim().slice(0, 2);
  if (sanitized in translations) {
    return sanitized as Language;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Extracts language from Accept-Language header
 */
function parseAcceptLanguage(header: string | null): Language {
  if (!header) return DEFAULT_LANGUAGE;
  
  // Parse "en-US,en;q=0.9,am;q=0.8" format
  const languages = header.split(',').map(lang => {
    const [code] = lang.split(';');
    return code.trim().split('-')[0];
  });
  
  // Find first supported language
  for (const lang of languages) {
    const validated = validateLanguage(lang);
    if (validated !== DEFAULT_LANGUAGE || lang === 'en') {
      return validated;
    }
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Get translation function for server-side use
 * 
 * @param request - Optional Request object to extract language from headers
 * @param language - Optional explicit language override
 * @returns Translation function
 * 
 * @example
 * // In API route
 * export async function GET(request: Request) {
 *   const t = getServerTranslation(request);
 *   return NextResponse.json({ message: t('common.success') });
 * }
 * 
 * @example
 * // In server component
 * export default async function ServerComponent() {
 *   const t = getServerTranslation();
 *   return <h1>{t('common.welcome')}</h1>;
 * }
 */
export function getServerTranslation(
  request?: Request,
  language?: Language
): (key: string, fallback?: string) => string {
  let lang: Language = DEFAULT_LANGUAGE;
  
  if (language) {
    lang = validateLanguage(language);
  } else if (request) {
    const acceptLanguage = request.headers.get('accept-language');
    lang = parseAcceptLanguage(acceptLanguage);
  }
  
  return (key: string, fallback?: string): string => {
    // Sanitize key
    const sanitizedKey = key.replace(/[^a-zA-Z0-9._]/g, '');
    
    // Try current language
    const translation = translations[lang]?.[sanitizedKey];
    if (translation) return translation;
    
    // Fallback to English
    if (lang !== 'en') {
      const englishTranslation = translations.en?.[sanitizedKey];
      if (englishTranslation) return englishTranslation;
    }
    
    // Return fallback or key
    return fallback || sanitizedKey;
  };
}

/**
 * Get language from request headers
 */
export function getLanguageFromRequest(request: Request): Language {
  const acceptLanguage = request.headers.get('accept-language');
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Create response with language header
 */
export function createTranslatedResponse(
  data: any,
  request: Request,
  options?: ResponseInit
): Response {
  const lang = getLanguageFromRequest(request);
  
  return new Response(JSON.stringify(data), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Content-Language': lang,
      ...options?.headers,
    },
  });
}
