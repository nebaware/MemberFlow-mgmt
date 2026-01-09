#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Missing translation keys to add
const missingKeys = {
  "market": {
    "browse_products": "Browse Products"
  },
  "pricing": {
    "title": "AI Pricing Assistant",
    "description": "Get AI-powered pricing recommendations for your agricultural products"
  },
  "favorites": {
    "title": "My Favorites",
    "description": "Your saved products and wishlist"
  },
  "common": {
    "back_to_market": "Back to Marketplace",
    "browse_products": "Browse Products"
  }
};

// Function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Function to update translation file
function updateTranslationFile(filePath, newKeys) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    // Merge new keys
    deepMerge(translations, newKeys);
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update all language files
const languages = ['en', 'am', 'om', 'ti', 'so'];

languages.forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  
  // For non-English languages, use English values as fallback
  const keysToAdd = lang === 'en' ? missingKeys : missingKeys;
  
  updateTranslationFile(filePath, keysToAdd);
});

console.log('\n🎉 Translation fix complete!');
console.log('All missing keys have been added to translation files.');