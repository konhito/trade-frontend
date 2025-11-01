#!/usr/bin/env node

/**
 * Script to push schema to database with environment variable support
 * Can use DATABASE_URL from .env or pass directly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env file

console.log('🚀 Pushing schema to database...\n');

// Get DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;

// Check if we have a database URL
if (!databaseUrl) {
  console.log('⚠️  DATABASE_URL not found in environment');
  console.log('   Looking for .env file...');
  
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.log('\n❌ No .env file found!');
    console.log('\n📝 Please provide DATABASE_URL:');
    console.log('   Option 1: Create a .env file:');
    console.log('             Copy env.template to .env and edit it');
    console.log('   Option 2: Pass DATABASE_URL directly:');
    console.log('             DATABASE_URL="postgresql://..." node scripts/push-db-with-env.js');
    console.log('   Option 3: Set environment variable:');
    console.log('             export DATABASE_URL="postgresql://..." (Linux/Mac)');
    console.log('             $env:DATABASE_URL="postgresql://..." (PowerShell)');
    process.exit(1);
  }
  
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/DATABASE_URL=["']?([^"\n]+)["']?/);
  if (match) {
    databaseUrl = match[1];
    console.log('✅ Found DATABASE_URL in .env\n');
  } else {
    console.log('\n❌ DATABASE_URL not found in .env file');
    console.log('   Please add DATABASE_URL to your .env file');
    process.exit(1);
  }
}

console.log('✅ Using DATABASE_URL from environment\n');

try {
  // Step 1: Generate Prisma Client
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('\n✅ Prisma Client generated\n');

  // Step 2: Push to database
  console.log('2️⃣ Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('\n✅ Schema pushed successfully!\n');

  console.log('🎉 Database updated!');
  console.log('\n⚠️  Don\'t forget to restart your dev server!\n');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

