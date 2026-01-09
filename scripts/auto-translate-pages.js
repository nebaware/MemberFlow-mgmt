#!/usr/bin/env node

/**
 * Automated Translation Migration Script
 * 
 * This script automatically updates hardcoded text in pages to use translations.
 * 
 * Usage:
 *   node scripts/auto-translate-pages.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Show what would be changed without making changes
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');

// Mapping of hardcoded text to translation keys
const TRANSLATIONS = {
  // Transportation
  'My Delivery Schedule': 'transport.schedule.title',
  'View your upcoming and confirmed deliveries': 'transport.schedule.description',
  'Incoming Delivery Requests': 'transport.requests.title',
  'Manage new and ongoing transportation requests': 'transport.requests.description',
  
  // Tools
  'Tool & Equipment Orders': 'tools.orders.title',
  'Track sales and manage orders for your agricultural tools': 'tools.orders.description',
  'Manage Tool Inventory': 'tools.inventory.title',
  'Update stock levels, pricing, and details': 'tools.inventory.description',
  'Add New Tool or Equipment': 'tools.add.title',
  'List your agricultural tools': 'tools.add.description',
  
  // Storage
  'Manage My Storage Facilities': 'storage.my_facilities.title',
  'Update details, availability, and pricing': 'storage.my_facilities.description',
  'Storage Facility Bookings': 'storage.bookings.title',
  'View and manage bookings': 'storage.bookings.description',
  'List New Storage Facility': 'storage.add.title',
  'Add your agricultural storage facility': 'storage.add.description',
  
  // Products
  'My Products': 'products.my_products.title',
  'Manage your listed products': 'products.my_products.description',
  'Mark as Sold': 'products.mark_sold',
  'Edit Product': 'products.edit',
  'Remove Product': 'products.remove',
  
  // Learning
  'Learning Module': 'learning.module.title',
  'Manage My Learning Content': 'learning.my_content.title',
  'Edit, update, or unpublish your courses': 'learning.my_content.description',
  'Create Learning Content': 'learning.create.title',
  'Develop new courses': 'learning.create.description',
  
  // Payment
  'Verifying Payment': 'payment.verifying.title',
  'Please wait...': 'payment.verifying.description',
  'Payment Successful': 'payment.success.title',
  'Your order has been confirmed': 'payment.success.description',
  'Payment Failed': 'payment.failed.title',
  'There was an issue with your payment': 'payment.failed.description',
  
  // Actions
  'View': 'action.view',
  'Edit': 'action.edit',
  'Delete': 'action.delete',
  'Back to': 'action.back_to',
  
  // Status
  'Loading...': 'status.loading',
  'Not Found': 'status.not_found',
};

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // Check if file already imports useLanguage
  const hasUseLanguage = content.includes('useLanguage');
  const hasImport = content.includes("from '@/lib/i18n'") || content.includes("from '@/contexts/LanguageContext'");

  // Replace hardcoded strings
  Object.entries(TRANSLATIONS).forEach(([text, key]) => {
    // Match title="Text" or description="Text"
    const titleRegex = new RegExp(`(title|description)=["']${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g');
    
    if (titleRegex.test(content)) {
      content = content.replace(titleRegex, `$1={t('${key}')}`);
      modified = true;
      changes.push(`  - ${text} → t('${key}')`);
    }

    // Match >Text</
    const textRegex = new RegExp(`>\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g');
    
    if (textRegex.test(content)) {
      content = content.replace(textRegex, `>{t('${key}')}<`);
      modified = true;
      changes.push(`  - ${text} → t('${key}')`);
    }
  });

  if (modified) {
    // Add import if needed
    if (!hasImport) {
      // Find the last import statement
      const importRegex = /import .+ from .+;/g;
      const imports = content.match(importRegex);
      
      if (imports) {
        const lastImport = imports[imports.length - 1];
        const newImport = "import { useLanguage } from '@/lib/i18n';";
        content = content.replace(lastImport, `${lastImport}\n${newImport}`);
        changes.push('  + Added useLanguage import');
      }
    }

    // Add useLanguage hook if needed
    if (!hasUseLanguage) {
      // Find the component function
      const componentRegex = /export default function \w+\([^)]*\) \{/;
      const match = content.match(componentRegex);
      
      if (match) {
        const hookLine = "\n  const { t } = useLanguage();\n";
        content = content.replace(match[0], match[0] + hookLine);
        changes.push('  + Added useLanguage hook');
      }
    }

    console.log(`\n📝 ${filePath}`);
    changes.forEach(change => console.log(change));

    if (!DRY_RUN) {
      // Create backup
      fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
      
      // Write updated file
      fs.writeFileSync(filePath, content);
      console.log('  ✅ Updated');
    } else {
      console.log('  ⏭️  Skipped (dry-run)');
    }

    return true;
  }

  return false;
}

function main() {
  console.log('🚀 Starting Automated Translation Migration\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  const srcDir = path.join(process.cwd(), 'src', 'app');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src/app directory not found');
    process.exit(1);
  }

  const files = findFiles(srcDir);
  console.log(`📂 Found ${files.length} files\n`);

  let updatedCount = 0;

  files.forEach(file => {
    if (updateFile(file)) {
      updatedCount++;
    }
  });

  console.log(`\n✨ Migration ${DRY_RUN ? 'analysis' : 'complete'}!`);
  console.log(`   📊 Files updated: ${updatedCount}`);
  console.log(`   📊 Files unchanged: ${files.length - updatedCount}`);
  
  if (!DRY_RUN && updatedCount > 0) {
    console.log(`\n⚠️  Important:`);
    console.log(`   1. Review the changes`);
    console.log(`   2. Test your application`);
    console.log(`   3. Delete .backup files when satisfied`);
    console.log(`   4. Run: npm run dev`);
  } else if (DRY_RUN) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  }
}

main();
