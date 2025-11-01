#!/usr/bin/env node

// Test if historicalData column exists
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('\n🔍 Checking database schema...\n');
    
    // Try to query strategies to see if historicalData column exists
    const strategies = await prisma.strategy.findMany({
      take: 1,
      select: {
        id: true,
        name: true,
        historicalData: true
      }
    });
    
    console.log('✅ Schema updated successfully!');
    console.log('✅ historicalData column exists in Strategy table\n');
    
    if (strategies.length > 0) {
      console.log('Sample strategy:');
      console.log('  ID:', strategies[0].id);
      console.log('  Name:', strategies[0].name);
      console.log('  Has historicalData:', strategies[0].historicalData ? 'Yes' : 'No (null)\n');
    }
    
    console.log('✨ You can now import historical data for strategies!\n');
    
  } catch (error) {
    if (error.message.includes('Unknown arg `historicalData`')) {
      console.log('❌ Schema not updated yet');
      console.log('   Run: node push-schema.js\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();

