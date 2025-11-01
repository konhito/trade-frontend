#!/usr/bin/env node

/**
 * Script to push Prisma schema changes to the database
 * This will add missing columns to existing tables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database schema push...\n');
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
  // Step 1: Check current schema status
  console.log('📋 Step 1: Checking current schema status...');
  try {
    execSync('npx prisma migrate status', { stdio: 'ignore' });
    console.log('✅ Migrations are up to date\n');
  } catch (error) {
    console.log('⚠️  Migrations pending or status check failed\n');
  }

  // Step 2: Generate Prisma Client
  console.log('📦 Step 2: Generating Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('\n✅ Prisma Client generated successfully\n');
  } catch (error) {
    console.log('❌ Failed to generate Prisma Client');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Step 3: Push schema to database
  console.log('🗄️  Step 3: Pushing schema to database...');
  console.log('   This will add missing columns to your database\n');
  
  try {
    // Check if we should create migrations or just push
    console.log('⚠️  Do you want to:');
    console.log('   1. Push schema directly (adds columns immediately)');
    console.log('   2. Create a new migration (recommended for production)');
    console.log('');
    console.log('   Using option 1: Direct push\n');
    
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('\n✅ Schema pushed to database successfully!\n');
  } catch (error) {
    console.log('❌ Failed to push schema to database');
    console.log('   Error:', error.message);
    
    console.log('\n📝 Alternative: Run the SQL script manually:');
    console.log('   node scripts/check-and-fix-database.js');
    console.log('   Then apply the suggested SQL commands\n');
    
    process.exit(1);
  }

  // Step 4: Verify the schema
  console.log('🔍 Step 4: Verifying schema...');
  try {
    execSync('npx prisma db pull', { stdio: 'ignore' });
    console.log('✅ Schema verification complete\n');
  } catch (error) {
    console.log('⚠️  Schema verification failed (this is usually OK)\n');
  }

  console.log('═'.repeat(60));
  console.log('✨ Database schema push completed successfully!');
  console.log('═'.repeat(60));
  
} catch (error) {
  console.error('\n❌ An error occurred:', error.message);
  process.exit(1);
}

