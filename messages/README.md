# Translation Messages

## Current Status

### ✅ Fully Translated
- **English (en.json)** - Complete
- **Amharic (am.json)** - Complete  
- **Oromo (om.json)** - Complete

### ⚠️ Needs Translation
- **Tigrinya (ti.json)** - Currently using English (fallback)
- **Somali (so.json)** - Currently using English (fallback)

## How It Works

The app uses `next-intl` for internationalization. When a user selects a language:

1. The app loads the corresponding JSON file
2. If a translation is missing, it falls back to English
3. All UI text is replaced with the translated version

## Adding Translations

### For Tigrinya (ti.json)

The file currently contains English text. To translate:

1. Open `messages/ti.json`
2. Replace English values with Tigrinya (ትግርኛ) translations
3. Keep the JSON structure and keys unchanged
4. Only translate the values (right side of the colon)

Example:
```json
{
  "nav": {
    "dashboard": "ሰሌዳ መቆጻጸሪ",  // Translate this
    "marketplace": "ዕዳጋ",        // Translate this
    ...
  }
}
```

### For Somali (so.json)

Same process as Tigrinya:

1. Open `messages/so.json`
2. Replace English values with Somali (Soomaali) translations
3. Keep JSON structure intact

Example:
```json
{
  "nav": {
    "dashboard": "Loox Xakamaynta",  // Translate this
    "marketplace": "Suuqa",           // Translate this
    ...
  }
}
```

## Translation Guidelines

1. **Keep Keys Unchanged**: Only translate values, not keys
2. **Maintain Placeholders**: Keep `{name}`, `{count}`, etc. as-is
3. **Cultural Sensitivity**: Ensure translations are culturally appropriate
4. **Consistency**: Use consistent terminology throughout
5. **Test**: Test the UI after translating to ensure proper display

## Getting Help

### Professional Translation Services
- Contact Ethiopian translation agencies
- Hire native speakers for quality assurance
- Use translation memory tools for consistency

### Community Translation
- Engage with Tigrinya and Somali speaking communities
- Get feedback from native speakers
- Iterate based on user feedback

## Priority Sections

Translate these sections first for immediate impact:

1. **nav** - Navigation menu items
2. **common** - Common UI elements (buttons, labels)
3. **dashboard** - Dashboard text
4. **market** - Marketplace interface
5. **product** - Product pages

## File Structure

```
messages/
├── en.json          ✅ English (complete)
├── am.json          ✅ Amharic (complete)
├── om.json          ✅ Oromo (complete)
├── ti.json          ⚠️  Tigrinya (needs translation)
├── so.json          ⚠️  Somali (needs translation)
└── README.md        📖 This file
```

## Testing Translations

1. Start the dev server: `npm run dev`
2. Use the language switcher in the header
3. Navigate through the app
4. Check for:
   - Missing translations (shows English)
   - Text overflow (some languages are longer)
   - Character encoding issues
   - Cultural appropriateness

## Notes

- The app will work with English fallback until translations are complete
- Users can still select Tigrinya and Somali, they'll just see English text
- Partial translations are better than no translations
- Focus on high-traffic pages first

## Contact

For translation questions or to contribute translations, contact the development team.
