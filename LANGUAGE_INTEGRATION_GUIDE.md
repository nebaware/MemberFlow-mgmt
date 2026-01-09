# Language System Integration Guide

## Current Setup

Your app currently uses `next-intl` for internationalization. The new multi-language system provides:

1. **5 Ethiopian Languages**: English, Amharic, Oromo, Tigrinya, Somali
2. **Enhanced Security**: Input validation, XSS prevention, safe storage
3. **Better DX**: TypeScript support, simple API, easy to extend

## Integration Options

### Option 1: Use Alongside next-intl (Recommended)

Keep `next-intl` for complex features (pluralization, date formatting) and use the new system for simple translations.

#### Step 1: Add Language Provider

Edit `src/app/[locale]/layout.tsx`:

```tsx
import { LanguageProvider } from '@/lib/i18n';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AppProvider>
              <LanguageProvider>  {/* Add this */}
                <ReactQueryProvider>
                  {children}
                </ReactQueryProvider>
              </LanguageProvider>  {/* Add this */}
            </AppProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### Step 2: Add Language Switcher

Edit your navigation component (e.g., `src/components/layout/header.tsx`):

```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

#### Step 3: Use in Components

```tsx
import { useLanguage } from '@/lib/i18n';

export function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.overview')}</p>
    </div>
  );
}
```

### Option 2: Replace next-intl (Advanced)

If you want to fully migrate to the new system:

#### Step 1: Remove next-intl

```bash
npm uninstall next-intl
```

#### Step 2: Update Layout

```tsx
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider>
          <AppProvider>
            <LanguageProvider>
              <ReactQueryProvider>
                {children}
              </ReactQueryProvider>
            </LanguageProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Step 3: Migrate Translations

Move translations from `next-intl` format to the new system.

## Quick Start (Standalone)

If starting fresh or in a new component:

### 1. Install (Already Done)

The system is already set up in:
- `src/lib/i18n/` - Core system
- `src/components/language/` - UI components

### 2. Wrap Your App

```tsx
import { LanguageProvider } from '@/lib/i18n';

function App() {
  return (
    <LanguageProvider>
      <YourApp />
    </LanguageProvider>
  );
}
```

### 3. Use Translations

```tsx
import { useLanguage } from '@/lib/i18n';

function Component() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <p>{t('common.welcome')}</p>
      <button onClick={() => setLanguage('am')}>
        Switch to Amharic
      </button>
    </div>
  );
}
```

### 4. Add Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';

<LanguageSwitcher />
```

## Adding Translations

### 1. Edit Translation Files

Add keys to all language files in `src/lib/i18n/translations/`:

```typescript
// en.ts
'feature.title': 'My Feature',
'feature.description': 'This is my feature',

// am.ts
'feature.title': 'የእኔ ባህሪ',
'feature.description': 'ይህ የእኔ ባህሪ ነው',

// om.ts
'feature.title': 'Amala Koo',
'feature.description': 'Kun amala koo ti',

// ti.ts
'feature.title': 'ባህርየይ',
'feature.description': 'እዚ ባህርየይ እዩ',

// so.ts
'feature.title': 'Astaamahayga',
'feature.description': 'Tani waa astaamahayga',
```

### 2. Use in Code

```tsx
const { t } = useLanguage();

<h1>{t('feature.title')}</h1>
<p>{t('feature.description')}</p>
```

## Testing

### Test All Languages

```tsx
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n';

test('renders in all languages', () => {
  const languages = ['en', 'am', 'om', 'ti', 'so'];
  
  languages.forEach(lang => {
    render(
      <LanguageProvider>
        <MyComponent />
      </LanguageProvider>
    );
    
    // Test translations appear
  });
});
```

## Security Checklist

✅ Input validation - Language codes are validated
✅ XSS prevention - Translation keys are sanitized  
✅ Safe storage - localStorage wrapped in try-catch
✅ Type safety - Full TypeScript support
✅ Fallbacks - Graceful degradation on errors

## Performance Tips

1. **Lazy Loading**: Load translations on demand (future enhancement)
2. **Memoization**: `t()` function is already memoized
3. **Storage**: Language preference cached in localStorage
4. **Bundle Size**: Only ~5KB for all translations

## Common Issues

### Issue: Translations not showing

**Solution**: 
1. Check if LanguageProvider wraps your component
2. Verify translation key exists in all language files
3. Check browser console for errors

### Issue: Hydration mismatch

**Solution**: The provider waits for initialization. If issues persist, add `suppressHydrationWarning` to your HTML tag.

### Issue: Language not persisting

**Solution**: Check localStorage is enabled and not blocked by browser settings.

## Migration from Old LanguageContext

If you have the old `src/contexts/LanguageContext.tsx`:

### Before:
```tsx
import { useLanguage } from '@/contexts/LanguageContext';
```

### After:
```tsx
import { useLanguage } from '@/lib/i18n';
```

The API is the same, so no code changes needed!

## Next Steps

1. ✅ System is installed and ready
2. Add LanguageProvider to your layout
3. Add LanguageSwitcher to navigation
4. Start using `t()` in components
5. Add more translations as needed

## Support

For questions or issues:
1. Check `LANGUAGE_SYSTEM.md` for detailed docs
2. Review translation files in `src/lib/i18n/translations/`
3. Test with the LanguageSwitcher component

## Resources

- Main Documentation: `LANGUAGE_SYSTEM.md`
- Translation Files: `src/lib/i18n/translations/`
- Example Component: `src/components/language/language-switcher.tsx`
