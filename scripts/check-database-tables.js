const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // Get all table names from the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('📊 Found tables in database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    console.log(`\n✅ Total: ${tables.length} tables\n`);

    // Check Trade table structure
    console.log('🔍 Checking Trade table columns...\n');
    const tradeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Trade'
      ORDER BY ordinal_position
    `;

    console.log('📋 Trade table columns:');
    tradeColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    });

    // Check if strategyId exists
    const hasStrategyId = tradeColumns.some(col => col.column_name === 'strategyId');
    console.log(`\n❓ Has strategyId column: ${hasStrategyId ? '✅ YES' : '❌ NO'}`);

    if (!hasStrategyId) {
      console.log('\n⚠️  Missing strategyId column! This needs to be added to the database.');
    }

    // Check other important tables
    const importantTables = ['User', 'TradingAccount', 'Strategy', 'TradingRule', 'TradingMistake'];
    console.log('\n🔍 Checking important tables:');
    
    for (const tableName of importantTables) {
      const exists = tables.some(t => t.table_name === tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
    }

    console.log('\n✨ Database check complete!');
  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseTables()
  .catch(console.error);

