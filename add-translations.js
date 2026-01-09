const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'messages', 'en.json');

// Read the JSON file
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Add market section
data.market = {
    "no_results": "No Products Found",
    "no_products_desc": "We couldn't find any products matching your current filters. Try adjusting your search."
};

// Add favorites section
data.favorites = {
    "no_items": "No favorite items yet",
    "add_some": "Start adding products to your favorites to see them here"
};

// Write back to file with proper formatting
fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');

console.log('✅ Successfully added market and favorites translations to en.json');
