# Multi-Language System (i18n)

Secure internationalization system supporting 5 Ethiopian languages.

## 🌍 Languages

- **English (en)** - English 🇬🇧
- **Amharic (am)** - አማርኛ 🇪🇹
- **Oromo (om)** - Afaan Oromoo 🇪🇹
- **Tigrinya (ti)** - ትግርኛ 🇪🇹
- **Somali (so)** - Soomaali 🇸🇴

## 📦 Installation

Already installed! Just import and use.

## 🚀 Quick Start

```tsx
import { LanguageProvider, useLanguage } from '@/lib/i18n';

// 1. Wrap your app
function App() {
  return (
    <LanguageProvider>
      <YourApp />
    </LanguageProvider>
  );
}

// 2. Use in components
function Component() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => setLanguage('am')}>አማርኛ</button>
    </div>
  );
}
```

## 📖 API

### `useLanguage()`

```tsx
const { language, setLanguage, t, isRTL } = useLanguage();
```

- `language` - Current language code
- `setLanguage(lang)` - Change language
- `t(key, fallback?)` - Translate key
- `isRTL` - Is RTL language

## 🔑 Translation Keys

See `translations/` folder for all available keys.

Common patterns:
- `common.*` - UI elements
- `nav.*` - Navigation
- `auth.*` - Authentication
- `payment.*` - Payments
- `order.*` - Orders

## ➕ Adding Translations

1. Edit `translations/en.ts`:
```typescript
'feature.title': 'My Feature',
```

2. Add to other languages (am, om, ti, so)

3. Use in code:
```tsx
<h1>{t('feature.title')}</h1>
```

## 🔒 Security

✅ Input validation
✅ XSS prevention
✅ Safe storage
✅ Type safety

## 📚 Documentation

- [Complete Guide](../../../LANGUAGE_SYSTEM.md)
- [Integration Guide](../../../LANGUAGE_INTEGRATION_GUIDE.md)
- [Quick Reference](../../../LANGUAGE_QUICK_REFERENCE.md)

## 🎨 Components

```tsx
import { LanguageSwitcher } from '@/components/language/language-switcher';
import { LanguageDemo } from '@/components/language/language-demo';

<LanguageSwitcher />  // Dropdown selector
<LanguageDemo />      // Testing component
```

## 🧪 Testing

```tsx
import { render } from '@testing-library/react';
import { LanguageProvider } from '@/lib/i18n';

test('renders with translation', () => {
  render(
    <LanguageProvider>
      <MyComponent />
    </LanguageProvider>
  );
});
```

## 📁 Structure

```
i18n/
├── types.ts           # Types and metadata
├── context.tsx        # React context
├── index.ts           # Exports
├── translations/
│   ├── en.ts         # English
│   ├── am.ts         # Amharic
│   ├── om.ts         # Oromo
│   ├── ti.ts         # Tigrinya
│   └── so.ts         # Somali
└── README.md         # This file
```

## 💡 Tips

1. Always provide fallbacks: `t('key', 'Fallback')`
2. Use descriptive keys: `payment.method` not `pm`
3. Test all languages with LanguageDemo
4. Keep translations consistent across languages

## 🐛 Troubleshooting

**Translations not showing?**
- Check LanguageProvider wraps component
- Verify key exists in translation files

**Language not persisting?**
- Check localStorage is enabled
- Clear cache and retry

## 🤝 Contributing

1. Add translations to all 5 language files
2. Follow naming convention: `category.key`
3. Test with LanguageDemo
4. Update documentation

---

For detailed documentation, see [LANGUAGE_SYSTEM.md](../../../LANGUAGE_SYSTEM.md)
