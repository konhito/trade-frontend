#!/usr/bin/env node

/**
 * Script to create and apply a migration
 * This is the recommended approach for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database migration process...\n');
console.log('═'.repeat(60));

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('   Please create a .env file with your DATABASE_URL');
  console.log('   You can copy from env.template');
  process.exit(1);
}

console.log('✅ Found .env file\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Step 1: Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('\n✅ Prisma Client generated successfully\n');
  } catch (error) {
    console.log('❌ Failed to generate Prisma Client');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Step 2: Check migration status
  console.log('📋 Step 2: Checking migration status...');
  try {
    execSync('npx prisma migrate status', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Migration status check completed\n');
  }

  // Step 3: Create migration
  console.log('📝 Step 3: Creating migration...');
  console.log('   Migration name: add_missing_trade_columns\n');
  
  try {
    execSync('npx prisma migrate dev --name add_missing_trade_columns', { stdio: 'inherit' });
    console.log('\n✅ Migration created and applied successfully!\n');
  } catch (error) {
    console.log('❌ Failed to create migration');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  console.log('═'.repeat(60));
  console.log('✨ Database migration completed successfully!');
  console.log('═'.repeat(60));
  
} catch (error) {
  console.error('\n❌ An error occurred:', error.message);
  process.exit(1);
}

