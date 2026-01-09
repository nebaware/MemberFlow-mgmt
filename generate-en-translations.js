const fs = require('fs');
const path = require('path');

// Read the Amharic translation file as the source of truth for structure
const amharicPath = path.join(__dirname, 'messages', 'am.json');
const englishPath = path.join(__dirname, 'messages', 'en.json');

const amharic = JSON.parse(fs.readFileSync(amharicPath, 'utf8'));

// Create English translations based on Amharic structure
const english = {
    nav: {
        dashboard: "Dashboard",
        marketplace: "Marketplace",
        browse: "Browse Products",
        list_product: "List Your Product",
        orders: "My Orders & Sales",
        favorites: "My Favorites",
        services: "Services & Tools",
        ai_advisor: "AI Crop Advisor",
        pricing: "Pricing Assistant",
        cooperative: "Cooperative Planner",
        iot_weather: "IoT & Weather",
        transportation: "Request Transport",
        storage: "Find Storage",
        learning: "Learning Hub",
        profile: "My Profile",
        earnings: "My Earnings",
        transactions: "Transactions",
        notifications: "Notifications",
        settings: "Settings",
        admin: "Admin Panel",
        join: "Join Azmera",
        about: "About Us"
    },
    common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        birr: "Birr",
        all: "All",
        active: "Active",
        active_filters: "Active Filters",
        showing: "Showing",
        of: "of",
        products: "products",
        refresh: "Refresh",
        back: "Back",
        next: "Next",
        previous: "Previous",
        close: "Close",
        confirm: "Confirm",
        not_found: "Not Found"
    },
    error: {
        title: "Error",
        message: "Something went wrong",
        try_again: "Try Again"
    },
    dashboard: amharic.dashboard ? Object.fromEntries(
        Object.keys(amharic.dashboard).map(key => [key, amharic.dashboard[key]])
    ) : {},
    farmer_dash: {
        welcome: "Welcome Back, Farmer!",
        overview: "Here's your farm business overview",
        total_sales: "Total Sales",
        new_orders: "New Orders",
        pending_escrow: "Pending in Escrow",
        products_listed: "Products Listed",
        list_product: "List New Product",
        quick_actions: "Quick Actions",
        recent_activity: "Recent Activity",
        sales_chart: "Sales Overview (Last 7 Days)",
        view_all_orders: "View All Orders",
        manage_products: "Manage Products",
        check_weather: "Check Weather",
        ai_advisor: "AI Crop Advisor",
        view_sales: "View Sales",
        earnings: "View Earnings",
        no_activity: "No recent activity"
    },
    buyer_dash: amharic.buyer_dash ? Object.fromEntries(
        Object.keys(amharic.buyer_dash).map(key => [key, amharic.buyer_dash[key]])
    ) : {},
    market: amharic.market ? Object.fromEntries(
        Object.keys(amharic.market).map(key => [key, amharic.market[key]])
    ) : {},
    product: amharic.product ? Object.fromEntries(
        Object.keys(amharic.product).map(key => [key, amharic.product[key]])
    ) : {},
    orders: amharic.orders ? Object.fromEntries(
        Object.keys(amharic.orders).map(key => [key, amharic.orders[key]])
    ) : {},
    pricing: {
        title: "AI Pricing Assistant",
        description: "Get AI-powered pricing suggestions for your products",
        product_details: "Product Details",
        product_details_desc: "Enter product information for AI analysis",
        product_name: "Product Name",
        product_name_placeholder: "e.g., Premium Coffee Beans",
        category: "Category",
        select_category: "Select a category",
        quantity: "Quantity (kg)",
        current_price: "Your Current Price (Birr)",
        quality: "Quality Grade",
        select_quality: "Select quality",
        quality_premium: "Premium",
        quality_standard: "Standard",
        quality_basic: "Basic",
        location: "Location",
        select_location: "Select your location",
        get_suggestion: "Get AI Suggestion",
        analyzing: "Analyzing Market Data...",
        ai_suggestion: "AI Price Suggestion",
        suggested_price: "Suggested Price",
        your_price: "Your Price",
        price_comparison: "Price Comparison"
    },
    ai: amharic.ai ? Object.fromEntries(
        Object.keys(amharic.ai).map(key => [key, amharic.ai[key]])
    ) : {},
    cooperative: amharic.cooperative ? Object.fromEntries(
        Object.keys(amharic.cooperative).map(key => [key, amharic.cooperative[key]])
    ) : {},
    transport: amharic.transport ? Object.fromEntries(
        Object.keys(amharic.transport).map(key => [key, amharic.transport[key]])
    ) : {},
    transportation: amharic.transportation ? Object.fromEntries(
        Object.keys(amharic.transportation).map(key => [key, amharic.transportation[key]])
    ) : {},
    storage: amharic.storage ? Object.fromEntries(
        Object.keys(amharic.storage).map(key => [key, amharic.storage[key]])
    ) : {},
    learning: amharic.learning ? Object.fromEntries(
        Object.keys(amharic.learning).map(key => [key, amharic.learning[key]])
    ) : {},
    notif: amharic.notif ? Object.fromEntries(
        Object.keys(amharic.notif).map(key => [key, amharic.notif[key]])
    ) : {},
    notifications: amharic.notifications ? Object.fromEntries(
        Object.keys(amharic.notifications).map(key => [key, amharic.notifications[key]])
    ) : {},
    trans: amharic.trans ? Object.fromEntries(
        Object.keys(amharic.trans).map(key => [key, amharic.trans[key]])
    ) : {},
    transactions: amharic.transactions ? Object.fromEntries(
        Object.keys(amharic.transactions).map(key => [key, amharic.transactions[key]])
    ) : {},
    earnings: amharic.earnings ? Object.fromEntries(
        Object.keys(amharic.earnings).map(key => [key, amharic.earnings[key]])
    ) : {},
    profile: amharic.profile ? Object.fromEntries(
        Object.keys(amharic.profile).map(key => [key, amharic.profile[key]])
    ) : {},
    favorites: amharic.favorites ? Object.fromEntries(
        Object.keys(amharic.favorites).map(key => [key, amharic.favorites[key]])
    ) : {},
    cart: amharic.cart ? Object.fromEntries(
        Object.keys(amharic.cart).map(key => [key, amharic.cart[key]])
    ) : {},
    checkout: amharic.checkout ? Object.fromEntries(
        Object.keys(amharic.checkout).map(key => [key, amharic.checkout[key]])
    ) : {},
    about: amharic.about ? Object.fromEntries(
        Object.keys(amharic.about).map(key => [key, amharic.about[key]])
    ) : {},
    join: amharic.join ? Object.fromEntries(
        Object.keys(amharic.join).map(key => [key, amharic.join[key]])
    ) : {},
    iot: amharic.iot ? Object.fromEntries(
        Object.keys(amharic.iot).map(key => [key, amharic.iot[key]])
    ) : {},
    consultations: amharic.consultations ? Object.fromEntries(
        Object.keys(amharic.consultations).map(key => [key, amharic.consultations[key]])
    ) : {},
    admin: amharic.admin ? Object.fromEntries(
        Object.keys(amharic.admin).map(key => [key, amharic.admin[key]])
    ) : {}
};

// Write the English file
fs.writeFileSync(englishPath, JSON.stringify(english, null, 4), 'utf8');

console.log('✅ English translation file generated successfully!');
console.log(`Total sections: ${Object.keys(english).length}`);
console.log(`farmer_dash keys: ${Object.keys(english.farmer_dash).length}`);
