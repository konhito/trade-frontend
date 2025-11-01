#!/usr/bin/env node

/**
 * Simple script to push Prisma schema changes to database
 */

const { execSync } = require('child_process');

console.log('🚀 Pushing schema to database...\n');

try {
  // Push schema changes
  console.log('Executing: npx prisma db push --accept-data-loss');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit' 
  });
  
  console.log('\n✅ Success! Schema pushed to database.');
  console.log('\n⚠️  You may need to restart your dev server.\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nIf you see "EPERM" error, stop your dev server first.');
  process.exit(1);
}

