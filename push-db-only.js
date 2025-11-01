#!/usr/bin/env node

/**
 * Push schema to database (without generating Prisma Client)
 * Use this after you've already generated the client
 */

const { execSync } = require('child_process');

console.log('\n🚀 Pushing database schema...\n');

try {
  console.log('Pushing schema changes to database...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });
  
  console.log('\n✅ Schema pushed successfully!');
  console.log('\n📝 What was added:');
  console.log('   - historicalData column to Strategy table');
  console.log('\n✨ You can now import backtest vs live data for strategies!');
  console.log('\n💡 Next step: Restart your dev server\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Make sure:');
  console.error('   1. Stop your dev server (Ctrl+C)');
  console.error('   2. Then run this script again\n');
  process.exit(1);
}

