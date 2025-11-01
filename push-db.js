#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('\n🚀 Pushing database schema...\n');

try {
  console.log('Step 1: Generating Prisma Client');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');

  console.log('Step 2: Pushing schema to database');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Schema pushed successfully\n');

  console.log('✨ Database updated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your dev server');
  console.log('   2. Go to http://localhost:3000/dashboard/strategies');
  console.log('   3. Click Upload button on any strategy');
  console.log('   4. Import your historical backtest vs live data\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   - Stop your dev server first (Ctrl+C)');
  console.error('   - Make sure DATABASE_URL is set in .env');
  console.error('   - Try running: npm run dev\n');
  process.exit(1);
}

