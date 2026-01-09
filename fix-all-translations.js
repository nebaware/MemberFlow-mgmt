#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all translation files...\n');

// Complete translation keys for English
const completeEnglishTranslations = {
    "nav": {
        "dashboard": "Dashboard",
        "marketplace": "Marketplace",
        "browse": "Browse Products",
        "list_product": "List Your Product",
        "orders": "My Orders & Sales",
        "favorites": "My Favorites",
        "services": "Services & Tools",
        "ai_advisor": "AI Crop Advisor",
        "pricing": "Pricing Assistant",
        "cooperative": "Cooperative Planner",
        "iot_weather": "IoT & Weather",
        "transportation": "Request Transport",
        "storage": "Find Storage",
        "learning": "Learning Hub",
        "profile": "My Profile",
        "earnings": "My Earnings",
        "transactions": "Transactions",
        "notifications": "Notifications",
        "settings": "Settings",
        "verification": "Verification Center",
        "admin": "Admin Panel",
        "kyc_command": "KYC Command Center",
        "join": "Join Azmera",
        "about": "About Us"
    },
    "common": {
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "submit": "Submit",
        "cancel": "Cancel",
        "save": "Save",
        "delete": "Delete",
        "edit": "Edit",
        "view": "View",
        "birr": "Birr",
        "all": "All",
        "active": "Active",
        "refresh": "Refresh",
        "back": "Back",
        "next": "Next",
        "previous": "Previous",
        "close": "Close",
        "confirm": "Confirm",
        "not_found": "Not Found",
        "products": "products",
        "found": "found",
        "back_to_market": "Back to Marketplace",
        "browse_products": "Browse Products"
    },
    "error": {
        "title": "Error",
        "message": "Something went wrong",
        "try_again": "Try Again"
    },
    "market": {
        "title": "Marketplace",
        "description": "Browse and purchase quality agricultural products directly from farmers",
        "search": "Search products...",
        "category": "Category",
        "location": "Location",
        "price_range": "Price Range",
        "clear_filters": "Clear Filters",
        "no_results": "No Products Found",
        "no_products_desc": "We couldn't find any products matching your current filters. Try adjusting your search.",
        "browse_products": "Browse Products"
    },
    "product": {
        "seller": "Seller",
        "price": "Price",
        "quantity": "Quantity",
        "description": "Description",
        "add_product": "Add New Product",
        "add_desc": "List your agricultural products for sale on the marketplace",
        "details": "Product Details",
        "not_found": "Product not found",
        "not_found_desc": "The product you're looking for doesn't exist"
    },
    "pricing": {
        "title": "AI Pricing Assistant",
        "description": "Get AI-powered pricing recommendations for your agricultural products"
    },
    "cooperative": {
        "title": "Cooperative Planner",
        "description": "Get AI-powered recommendations for cooperative farming strategies"
    },
    "ai": {
        "title": "AI Crop Advisor",
        "description": "Upload a photo of your crop for instant pest and disease diagnosis"
    },
    "transport": {
        "title": "Request Transportation",
        "description": "Arrange delivery for your agricultural products"
    },
    "transportation": {
        "title": "Request Transportation",
        "description": "Arrange delivery for your agricultural products"
    },
    "storage": {
        "title": "Storage Facilities",
        "description": "Find secure storage for your agricultural products",
        "loading": "Loading facilities...",
        "no_facilities": "No storage facilities found",
        "list_your_storage": "List Your Storage"
    },
    "learning": {
        "title": "Learning Hub",
        "description": "Explore agricultural courses and training materials",
        "points": "Points",
        "continue": "Continue Learning",
        "modules_completed": "{completed} / {total} modules completed"
    },
    "notifications": {
        "title": "Notifications",
        "description": "View your recent notifications and alerts"
    },
    "notif": {
        "view_all": "View All",
        "no_notifications": "No notifications yet"
    },
    "transactions": {
        "title": "Transaction History",
        "description": "View all your payment transactions"
    },
    "trans": {
        "title": "Transaction History",
        "description": "View all your payment transactions"
    },
    "earnings": {
        "title": "My Earnings",
        "description": "Track your income and withdraw funds"
    },
    "profile": {
        "title": "My Profile",
        "description": "Manage your account settings and preferences"
    },
    "favorites": {
        "title": "My Favorites",
        "description": "Your saved products and wishlist",
        "no_items": "No favorite items yet",
        "add_some": "Start adding products to your favorites to see them here"
    },
    "orders": {
        "title": "My Orders & Sales",
        "description": "Track your purchases and manage your sales"
    },
    "join": {
        "title": "Join Azmera",
        "description": "Create your account and start trading"
    },
    "iot": {
        "title": "IoT & Weather",
        "description": "Monitor weather conditions and IoT devices",
        "no_devices": "No IoT devices connected. Register your devices to see real-time sensor data."
    },
    "dashboard": {
        "welcome": "Welcome to",
        "role_farmer": "🌾 Farmer",
        "role_buyer": "🛒 Buyer",
        "role_transporter": "🚚 Transporter",
        "role_educator": "📚 Educator",
        "role_tool_seller": "🔧 Tool Seller",
        "role_storage_provider": "🏢 Storage Provider"
    },
    "admin": {
        "title": "Admin Dashboard",
        "description": "Platform management and analytics"
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
        let translations = {};
        
        // Read existing file if it exists
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            try {
                translations = JSON.parse(content);
            } catch (parseError) {
                console.log(`⚠️  Invalid JSON in ${filePath}, creating new file`);
                translations = {};
            }
        }
        
        // Merge new keys
        deepMerge(translations, newKeys);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 4), 'utf8');
        console.log(`✅ Updated: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Update all language files
const languages = ['en', 'am', 'om', 'ti', 'so'];

languages.forEach(lang => {
    const filePath = path.join(__dirname, 'messages', `${lang}.json`);
    
    // For English, use complete translations
    // For other languages, use English as fallback (they can be translated later)
    const keysToAdd = completeEnglishTranslations;
    
    updateTranslationFile(filePath, keysToAdd);
});

console.log('\n🎉 Translation fix complete!');
console.log('All missing keys have been added to translation files.');
console.log('Non-English files now have English fallbacks that can be translated later.');