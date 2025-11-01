#!/usr/bin/env node

/**
 * Quick script to push schema changes without prompts
 * Use with caution!
 */

const { execSync } = require('child_process');

console.log('🚀 Quick pushing schema to database...\n');

try {
  // Generate Prisma Client
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Done\n');

  // Push to database
  console.log('2️⃣ Pushing to database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('\n✅ Success!\n');

  console.log('🎉 Database updated successfully!\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

