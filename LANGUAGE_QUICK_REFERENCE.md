# Language System - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Add Provider
```tsx
import { LanguageProvider } from '@/lib/i18n';

<LanguageProvider>
  <YourApp />
</LanguageProvider>
```

### 2. Add Switcher
```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';

<LanguageSwitcher />
```

### 3. Use Translations
```tsx
import { useLanguage } from '@/lib/i18n';

const { t } = useLanguage();
<h1>{t('common.welcome')}</h1>
```

## 🌍 Supported Languages

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| `en` | English | English | 🇬🇧 |
| `am` | Amharic | አማርኛ | 🇪🇹 |
| `om` | Oromo | Afaan Oromoo | 🇪🇹 |
| `ti` | Tigrinya | ትግርኛ | 🇪🇹 |
| `so` | Somali | Soomaali | 🇸🇴 |

## 📖 API Reference

### `useLanguage()`

```tsx
const { language, setLanguage, t, isRTL } = useLanguage();
```

| Property | Type | Description |
|----------|------|-------------|
| `language` | `Language` | Current language code |
| `setLanguage` | `(lang: Language) => void` | Change language |
| `t` | `(key: string, fallback?: string) => string` | Translate key |
| `isRTL` | `boolean` | Is RTL language |

### Examples

```tsx
// Get current language
const { language } = useLanguage();
console.log(language); // 'en', 'am', 'om', 'ti', or 'so'

// Change language
const { setLanguage } = useLanguage();
setLanguage('am'); // Switch to Amharic

// Translate
const { t } = useLanguage();
t('common.welcome'); // Returns translation

// With fallback
t('missing.key', 'Default text'); // Returns 'Default text' if key missing

// Check direction
const { isRTL } = useLanguage();
<div dir={isRTL ? 'rtl' : 'ltr'}>...</div>
```

## 🔑 Available Translation Keys

### Common
```tsx
t('common.loading')    // Loading...
t('common.error')      // Error
t('common.success')    // Success
t('common.save')       // Save
t('common.cancel')     // Cancel
t('common.delete')     // Delete
t('common.edit')       // Edit
t('common.search')     // Search
```

### Navigation
```tsx
t('nav.dashboard')     // Dashboard
t('nav.marketplace')   // Marketplace
t('nav.orders')        // Orders
t('nav.wallet')        // Wallet
t('nav.profile')       // Profile
t('nav.settings')      // Settings
```

### Auth
```tsx
t('auth.login')        // Login
t('auth.register')     // Register
t('auth.email')        // Email
t('auth.password')     // Password
```

### Payment
```tsx
t('payment.method')    // Payment Method
t('payment.wallet')    // Wallet Balance
t('payment.chapa')     // Chapa
t('payment.total')     // Total
t('payment.success')   // Payment Successful
```

### Orders
```tsx
t('order.number')      // Order Number
t('order.status')      // Status
t('order.pending')     // Pending
t('order.paid')        // Paid
t('order.delivered')   // Delivered
```

## ➕ Adding New Translations

### Step 1: Add to English
```typescript
// src/lib/i18n/translations/en.ts
'feature.title': 'My Feature',
'feature.button': 'Click Me',
```

### Step 2: Add to Other Languages
```typescript
// am.ts
'feature.title': 'የእኔ ባህሪ',
'feature.button': 'ጠቅ አድርግ',

// om.ts
'feature.title': 'Amala Koo',
'feature.button': 'Na Cuqaasi',

// ti.ts
'feature.title': 'ባህርየይ',
'feature.button': 'ጠውቕ',

// so.ts
'feature.title': 'Astaamahayga',
'feature.button': 'I guji',
```

### Step 3: Use in Code
```tsx
<h1>{t('feature.title')}</h1>
<button>{t('feature.button')}</button>
```

## 🎨 Components

### LanguageSwitcher
```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';

// In your navigation
<LanguageSwitcher />
```

Features:
- Dropdown menu
- Native language names
- Flag emojis
- Current language indicator

### LanguageDemo
```tsx
import { LanguageDemo } from '@/components/language/language-demo';

// For testing
<LanguageDemo />
```

Features:
- Test all languages
- View sample translations
- Quick language switching

## 🔒 Security Features

✅ **Input Validation** - Only whitelisted languages
✅ **XSS Prevention** - Sanitized translation keys
✅ **Safe Storage** - Protected localStorage access
✅ **Type Safety** - Full TypeScript support

## 🐛 Troubleshooting

### Translations not showing?
1. Check LanguageProvider wraps your component
2. Verify key exists in translation files
3. Check browser console for errors

### Language not persisting?
1. Check localStorage is enabled
2. Clear cache and try again
3. Check browser privacy settings

### Hydration mismatch?
Add `suppressHydrationWarning` to `<html>` tag

## 📁 File Locations

```
src/lib/i18n/
├── types.ts              # Types
├── context.tsx           # Context
├── index.ts              # Exports
└── translations/
    ├── en.ts            # English
    ├── am.ts            # Amharic
    ├── om.ts            # Oromo
    ├── ti.ts            # Tigrinya
    └── so.ts            # Somali

src/components/language/
├── language-switcher.tsx # Switcher UI
└── language-demo.tsx     # Demo component
```

## 📚 Full Documentation

- **Complete Guide**: `LANGUAGE_SYSTEM.md`
- **Integration**: `LANGUAGE_INTEGRATION_GUIDE.md`
- **Summary**: `LANGUAGE_SYSTEM_SUMMARY.md`
- **This Card**: `LANGUAGE_QUICK_REFERENCE.md`

## 💡 Tips

1. **Always provide fallback**: `t('key', 'Fallback text')`
2. **Use dot notation**: `category.subcategory.key`
3. **Keep keys descriptive**: `payment.method` not `pm`
4. **Test all languages**: Use LanguageDemo component
5. **Check native speakers**: Verify translations are correct

## 🎯 Common Patterns

### Button with translation
```tsx
<Button>{t('common.save')}</Button>
```

### Form label
```tsx
<Label>{t('auth.email')}</Label>
<Input type="email" />
```

### Error message
```tsx
{error && <p className="text-red-500">{t('common.error')}</p>}
```

### Conditional text
```tsx
{isLoading ? t('common.loading') : t('common.submit')}
```

### ARIA label
```tsx
<button aria-label={t('common.close')}>
  <X />
</button>
```

---

**Quick Links**:
- [Full Documentation](./LANGUAGE_SYSTEM.md)
- [Integration Guide](./LANGUAGE_INTEGRATION_GUIDE.md)
- [Summary](./LANGUAGE_SYSTEM_SUMMARY.md)
