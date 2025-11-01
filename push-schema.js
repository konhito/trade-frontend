#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env' });

const { execSync } = require('child_process');

console.log('\n🚀 Pushing database schema...\n');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in environment');
  console.log('   Make sure .env file exists and has DATABASE_URL\n');
  process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log('   Database:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'), '\n');

try {
  console.log('Pushing schema changes to database...\n');
  execSync('npx prisma db push --accept-data-loss --skip-generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  
  console.log('\n✅ Schema pushed successfully!');
  console.log('\n✨ Added: historicalData column to Strategy table');
  console.log('\n📝 Next: Restart your dev server\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Tip: Stop your dev server first (Ctrl+C)\n');
  process.exit(1);
}

