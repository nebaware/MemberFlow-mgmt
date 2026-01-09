# Translation Sample - Priority Keys

This document shows sample translations for the most important UI elements in Tigrinya and Somali.

## Navigation (nav)

### Tigrinya (ትግርኛ)
```json
{
  "nav": {
    "dashboard": "ሰሌዳ መቆጻጸሪ",
    "marketplace": "ዕዳጋ",
    "browse": "ፍርያት ድለ",
    "orders": "ትእዛዛት",
    "profile": "መግለጺ",
    "settings": "ምቕናይ"
  }
}
```

### Somali (Soomaali)
```json
{
  "nav": {
    "dashboard": "Loox Xakamaynta",
    "marketplace": "Suuqa",
    "browse": "Raadi Alaabta",
    "orders": "Dalabka",
    "profile": "Astaanta",
    "settings": "Dejinta"
  }
}
```

## Common UI (common)

### Tigrinya (ትግርኛ)
```json
{
  "common": {
    "loading": "ይጽዕን ኣሎ...",
    "error": "ጌጋ",
    "success": "ዓወት",
    "submit": "ኣቕርብ",
    "cancel": "ሰርዝ",
    "save": "ዓቅብ",
    "delete": "ደምስስ",
    "edit": "ኣርትዕ",
    "view": "ርአይ",
    "back": "ተመለስ",
    "next": "ቀጻሊ",
    "close": "ዕጸው"
  }
}
```

### Somali (Soomaali)
```json
{
  "common": {
    "loading": "Waa la soo rarayo...",
    "error": "Khalad",
    "success": "Guul",
    "submit": "Gudbi",
    "cancel": "Jooji",
    "save": "Kaydi",
    "delete": "Tirtir",
    "edit": "Wax ka beddel",
    "view": "Arag",
    "back": "Dib u noqo",
    "next": "Xiga",
    "close": "Xir"
  }
}
```

## Dashboard

### Tigrinya (ትግርኛ)
```json
{
  "dashboard": {
    "welcome": "እንቋዕ ብደሓን መጻእካ",
    "quick_actions": "ቅልጡፍ ተግባራት",
    "recent_activity": "ናይ ቀረባ ንጥፈታት",
    "total_sales": "ጠቕላላ ሽያጥ",
    "active_orders": "ንጡፍ ትእዛዛት"
  }
}
```

### Somali (Soomaali)
```json
{
  "dashboard": {
    "welcome": "Soo dhawoow",
    "quick_actions": "Ficillada Degdegga ah",
    "recent_activity": "Waxqabadka Dhawaan",
    "total_sales": "Wadarta Iibka",
    "active_orders": "Dalabka Firfircoon"
  }
}
```

## Marketplace

### Tigrinya (ትግርኛ)
```json
{
  "market": {
    "title": "ዕዳጋ",
    "search_placeholder": "ፍርያት ድለ...",
    "category": "ምድብ",
    "price": "ዋጋ",
    "add_to_cart": "ናብ ዓረብያ ወስኽ",
    "view_details": "ዝርዝር ርአይ"
  }
}
```

### Somali (Soomaali)
```json
{
  "market": {
    "title": "Suuqa",
    "search_placeholder": "Raadi alaabta...",
    "category": "Qaybta",
    "price": "Qiimaha",
    "add_to_cart": "Ku dar gaadhi",
    "view_details": "Arag faahfaahinta"
  }
}
```

## How to Use This Sample

### Step 1: Copy the Structure
Open `messages/ti.json` or `messages/so.json` and find the corresponding section.

### Step 2: Replace Values
Replace the English text with the translations from above.

### Step 3: Maintain Format
Keep the JSON structure exactly as shown:
```json
{
  "key": "translation",
  "another_key": "another translation"
}
```

### Step 4: Test
1. Save the file
2. Restart the dev server
3. Switch to the language
4. Check if translations appear

## Full Translation Checklist

### Priority 1 (Most Visible)
- [ ] nav (navigation menu)
- [ ] common (buttons, labels)
- [ ] dashboard (main dashboard)
- [ ] market (marketplace)

### Priority 2 (Frequently Used)
- [ ] product (product pages)
- [ ] orders (order management)
- [ ] profile (user profile)
- [ ] cart (shopping cart)

### Priority 3 (Important Features)
- [ ] ai (AI tools)
- [ ] pricing (pricing assistant)
- [ ] storage (storage facilities)
- [ ] transport (transportation)

### Priority 4 (Additional)
- [ ] learning (learning hub)
- [ ] notifications
- [ ] transactions
- [ ] settings

## Translation Tips

### For Tigrinya (ትግርኛ)
1. Use proper Ge'ez script
2. Maintain formal tone for business context
3. Consider regional variations
4. Test with native speakers from Tigray

### For Somali (Soomaali)
1. Use standard Somali orthography
2. Keep technical terms clear
3. Consider dialect differences
4. Test with native speakers

## Getting Professional Help

### Translation Services
- Ethiopian Translation Agency
- Freelance translators on Upwork/Fiverr
- University language departments
- Community organizations

### Quality Assurance
- Native speaker review
- Back-translation check
- User testing
- Iterative improvements

## Example: Complete Section

Here's how a complete section should look in `ti.json`:

```json
{
  "nav": {
    "dashboard": "ሰሌዳ መቆጻጸሪ",
    "marketplace": "ዕዳጋ",
    "browse": "ፍርያት ድለ",
    "list_product": "ፍርያት ዘርዝር",
    "orders": "ትእዛዛት",
    "favorites": "ተወዳዳሪ",
    "services": "ኣገልግሎታት",
    "ai_advisor": "AI ኣማኻሪ",
    "pricing": "ዋጋ ኣማኻሪ",
    "cooperative": "ሓባራዊ ውጥን",
    "iot_weather": "IoT ከምኡውን ኩነታት ኣየር",
    "transportation": "መጓዓዝያ ሕተት",
    "storage": "መኽዘን ርከብ",
    "learning": "ማእከል ትምህርቲ",
    "profile": "መግለጺ",
    "earnings": "ኣታዊ",
    "transactions": "ግብይታት",
    "notifications": "መጠንቀቕታታት",
    "settings": "ምቕናይ",
    "admin": "ሰሌዳ ኣስተዳዳሪ",
    "join": "ናብ ኣዝመራ ተጸንበር",
    "about": "ብዛዕባና"
  }
}
```

## Contact

For translation questions or to contribute:
- Check `messages/README.md`
- Review existing translations in `am.json` and `om.json`
- Test thoroughly before submitting

---

**Note**: These are sample translations. Professional review is recommended for production use.
