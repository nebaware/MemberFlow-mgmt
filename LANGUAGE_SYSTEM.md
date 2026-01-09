# Multi-Language System Documentation

## Overview

Azmera AgriTech platform supports 5 languages to serve Ethiopia's diverse population:

1. **English (en)** - International language
2. **Amharic (am)** - አማርኛ - Federal working language
3. **Oromo (om)** - Afaan Oromoo - Largest ethnic group
4. **Tigrinya (ti)** - ትግርኛ - Northern Ethiopia
5. **Somali (so)** - Soomaali - Eastern Ethiopia

## Architecture

### File Structure

```
src/lib/i18n/
├── types.ts                 # Type definitions
├── context.tsx              # React context with security
├── translations/
│   ├── index.ts            # Export all translations
│   ├── en.ts               # English translations
│   ├── am.ts               # Amharic translations
│   ├── om.ts               # Oromo translations
│   ├── ti.ts               # Tigrinya translations
│   └── so.ts               # Somali translations
└── index.ts                # Main export

src/components/language/
└── language-switcher.tsx   # UI component for switching
```

## Security Features

### 1. Input Validation
- All language codes are validated before use
- Only whitelisted languages are accepted
- Prevents injection attacks through language parameter

### 2. Sanitization
- Translation keys are sanitized to prevent XSS
- Only alphanumeric characters, dots, and underscores allowed
- Malicious input is stripped

### 3. Safe Storage
- localStorage access is wrapped in try-catch
- Validates data before storing and retrieving
- Graceful fallback on errors

### 4. Type Safety
- Full TypeScript support
- Compile-time checks for language codes
- Prevents runtime errors

## Usage

### 1. Setup Provider

Wrap your app with the LanguageProvider:

```tsx
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### 2. Use Translations

In any component:

```tsx
import { useLanguage } from '@/lib/i18n';

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.overview')}</p>
      
      {/* With fallback */}
      <span>{t('some.key', 'Default text')}</span>
    </div>
  );
}
```

### 3. Language Switcher

Add the switcher to your navigation:

```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';

export function Navigation() {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  );
}
```

## Adding New Translations

### 1. Add to Translation Files

Edit each language file in `src/lib/i18n/translations/`:

```typescript
// en.ts
export const en: Translations = {
  'feature.new_key': 'New Feature',
  // ...
};

// am.ts
export const am: Translations = {
  'feature.new_key': 'አዲስ ባህሪ',
  // ...
};
```

### 2. Translation Key Naming Convention

Use dot notation for organization:

- `common.*` - Common UI elements
- `nav.*` - Navigation items
- `auth.*` - Authentication
- `dashboard.*` - Dashboard
- `market.*` - Marketplace
- `payment.*` - Payment system
- `order.*` - Orders
- `[feature].*` - Feature-specific

### 3. Best Practices

1. **Keep keys descriptive**: `payment.method` not `pm`
2. **Group related keys**: Use prefixes like `order.status.*`
3. **Provide fallbacks**: Always have English translation
4. **Test all languages**: Verify translations display correctly
5. **Consider length**: Some languages are longer than others

## Integration with Existing Code

### Migrating from Old LanguageContext

The old `LanguageContext.tsx` can be gradually migrated:

```tsx
// Old way
import { useLanguage } from '@/contexts/LanguageContext';

// New way (same API)
import { useLanguage } from '@/lib/i18n';

// Usage remains the same
const { t, language, setLanguage } = useLanguage();
```

## Accessibility

### 1. HTML Lang Attribute

The system automatically sets `<html lang="...">` for screen readers.

### 2. Direction Support

RTL (Right-to-Left) support is built-in for future languages:

```typescript
const { isRTL } = useLanguage();

<div dir={isRTL ? 'rtl' : 'ltr'}>
  {content}
</div>
```

### 3. ARIA Labels

Use translations for ARIA labels:

```tsx
<button aria-label={t('common.close')}>
  <X />
</button>
```

## Performance

### 1. Code Splitting

Translations are imported statically but can be lazy-loaded:

```typescript
// Future optimization
const translations = {
  en: () => import('./translations/en'),
  am: () => import('./translations/am'),
  // ...
};
```

### 2. Memoization

The `t()` function is memoized with `useCallback` to prevent re-renders.

### 3. Storage

Language preference is cached in localStorage to avoid re-selection.

## Testing

### Unit Tests Example

```typescript
import { validateLanguage } from '@/lib/i18n/context';

describe('Language Validation', () => {
  it('accepts valid language codes', () => {
    expect(validateLanguage('en')).toBe('en');
    expect(validateLanguage('am')).toBe('am');
  });

  it('rejects invalid codes', () => {
    expect(validateLanguage('xx')).toBe('en');
    expect(validateLanguage('<script>')).toBe('en');
  });
});
```

## API Reference

### `useLanguage()`

Returns:
- `language: Language` - Current language code
- `setLanguage: (lang: Language) => void` - Change language
- `t: (key: string, fallback?: string) => string` - Translate key
- `isRTL: boolean` - Is current language RTL

### `SUPPORTED_LANGUAGES`

Object containing language metadata:

```typescript
{
  code: Language;
  name: string;        // English name
  nativeName: string;  // Native name
  direction: 'ltr' | 'rtl';
  flag: string;        // Emoji flag
}
```

## Troubleshooting

### Translations Not Showing

1. Check if key exists in translation file
2. Verify LanguageProvider wraps your component
3. Check browser console for errors
4. Clear localStorage and refresh

### Hydration Mismatch

The provider waits for initialization to prevent SSR/CSR mismatches.

### Missing Translations

The system falls back to:
1. English translation (if not already English)
2. Provided fallback string
3. The key itself

## Future Enhancements

1. **Dynamic Loading**: Load translations on demand
2. **Pluralization**: Handle singular/plural forms
3. **Interpolation**: Insert variables into translations
4. **Date/Number Formatting**: Locale-specific formatting
5. **Translation Management**: Admin UI for managing translations
6. **Auto-Translation**: AI-powered translation suggestions

## Contributing

When adding new features:

1. Add English translations first
2. Use AI or professional translators for other languages
3. Test with native speakers when possible
4. Update this documentation
5. Add tests for new translation keys

## Resources

- [Amharic Language](https://en.wikipedia.org/wiki/Amharic)
- [Oromo Language](https://en.wikipedia.org/wiki/Oromo_language)
- [Tigrinya Language](https://en.wikipedia.org/wiki/Tigrinya_language)
- [Somali Language](https://en.wikipedia.org/wiki/Somali_language)
- [i18n Best Practices](https://www.w3.org/International/questions/qa-i18n)
