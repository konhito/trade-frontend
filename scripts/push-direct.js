#!/usr/bin/env node

/**
 * Quick script to push schema - specify DATABASE_URL directly
 * Usage: DATABASE_URL="postgresql://..." node scripts/push-direct.js
 */

const { execSync } = require('child_process');

// Get DATABASE_URL from command line or environment
const databaseUrl = process.env.DATABASE_URL || process.argv[2];

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not provided!');
  console.log('\nUsage:');
  console.log('  DATABASE_URL="postgresql://..." node scripts/push-direct.js');
  console.log('  Or: node scripts/push-direct.js "postgresql://..."');
  process.exit(1);
}

console.log('🚀 Pushing schema to database...\n');
console.log('Database URL:', databaseUrl.replace(/:[^:]*@/, ':****@'), '\n');

try {
  // Generate Prisma Client
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });

  // Push to database
  console.log('\n2️⃣ Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });

  console.log('\n✅ Done! Restart your dev server.\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

