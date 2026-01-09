#!/usr/bin/env node

/**
 * Migration Script: Update Language Context Imports
 * 
 * This script helps migrate from the old LanguageContext to the new i18n system.
 * 
 * Usage:
 *   node scripts/migrate-language-imports.js
 * 
 * What it does:
 * - Finds all files importing from '@/contexts/LanguageContext'
 * - Updates imports to '@/lib/i18n'
 * - Creates a backup before modifying
 * 
 * Note: Review changes before committing!
 */

const fs = require('fs');
const path = require('path');

const OLD_IMPORT = "@/contexts/LanguageContext";
const NEW_IMPORT = "@/lib/i18n";

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses old import
  if (!content.includes(OLD_IMPORT)) {
    return false;
  }

  console.log(`📝 Migrating: ${filePath}`);

  // Create backup
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, content);
  console.log(`   ✅ Backup created: ${backupPath}`);

  // Replace import
  const newContent = content.replace(
    new RegExp(OLD_IMPORT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    NEW_IMPORT
  );

  // Write updated file
  fs.writeFileSync(filePath, newContent);
  console.log(`   ✅ Updated import`);

  return true;
}

function main() {
  console.log('🚀 Starting Language Context Migration\n');

  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ Error: src directory not found');
    process.exit(1);
  }

  const files = findFiles(srcDir);
  console.log(`📂 Found ${files.length} TypeScript files\n`);

  let migratedCount = 0;

  files.forEach(file => {
    if (migrateFile(file)) {
      migratedCount++;
    }
  });

  console.log(`\n✨ Migration complete!`);
  console.log(`   📊 Files migrated: ${migratedCount}`);
  console.log(`   📊 Files unchanged: ${files.length - migratedCount}`);
  
  if (migratedCount > 0) {
    console.log(`\n⚠️  Important:`);
    console.log(`   1. Review the changes`);
    console.log(`   2. Test your application`);
    console.log(`   3. Delete .backup files when satisfied`);
    console.log(`   4. Commit the changes`);
  }
}

main();
