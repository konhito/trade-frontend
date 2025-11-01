const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixDatabase() {
  try {
    console.log('🔍 Starting database check...\n');

    // Check if required tables exist
    const requiredTables = [
      'Trade',
      'User', 
      'TradingAccount',
      'Strategy',
      'TradingRule',
      'TradingMistake',
      'Tag'
    ];

    console.log('📊 Checking required tables...');
    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const existingTableNames = existingTables.map(t => t.table_name);
    
    for (const table of requiredTables) {
      const exists = existingTableNames.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
      
      if (!exists) {
        console.log(`⚠️  Table ${table} is missing and needs to be created`);
      }
    }

    console.log(`\n✅ Found ${existingTableNames.length} tables total\n`);

    // Check Trade table columns
    console.log('🔍 Checking Trade table columns...\n');
    const tradeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Trade'
      ORDER BY ordinal_position
    `;

    console.log(`Trade table has ${tradeColumns.length} columns:\n`);
    tradeColumns.forEach((col, idx) => {
      const required = col.is_nullable === 'NO' ? ' (required)' : ' (nullable)';
      console.log(`${idx + 1}. ${col.column_name}: ${col.data_type}${required}`);
    });

    // Check for missing columns that are in the schema
    const schemaColumns = [
      'id', 'accountNumber', 'quantity', 'entryId', 'closeId', 
      'instrument', 'entryPrice', 'closePrice', 'entryDate', 'closeDate',
      'pnl', 'timeInPosition', 'userId', 'side', 'commission', 'createdAt',
      'comment', 'videoUrl', 'tags', 'imageBase64', 'imageBase64Second', 
      'groupId', 'symbol', 'direction', 'strategy', 'strategyId', 'duration', 
      'status', 'pnlPercent', 'notes', 'psychology'
    ];

    const existingColumnNames = tradeColumns.map(c => c.column_name);
    const missingColumns = schemaColumns.filter(col => !existingColumnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log(`\n⚠️  Missing columns in Trade table:\n`);
      missingColumns.forEach(col => console.log(`  - ${col}`));
      console.log(`\n📝 These columns need to be added via migration.`);
    } else {
      console.log(`\n✅ All expected columns exist in Trade table`);
    }

    // Check if strategyId exists (this is the current error)
    const hasStrategyId = existingColumnNames.includes('strategyId');
    console.log(`\n${hasStrategyId ? '✅' : '❌'} strategyId column exists: ${hasStrategyId}`);
    
    if (!hasStrategyId) {
      console.log('\n🔧 SUGGESTED FIX:');
      console.log('Run this SQL to add the missing columns:');
      console.log(`
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategyId" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "symbol" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "direction" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "strategy" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "duration" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Open';
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "pnlPercent" DOUBLE PRECISION;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "public"."Trade" ADD COLUMN IF NOT EXISTS "psychology" JSONB;

CREATE INDEX IF NOT EXISTS "Trade_symbol_idx" ON "public"."Trade"("symbol");
CREATE INDEX IF NOT EXISTS "Trade_strategy_idx" ON "public"."Trade"("strategy");
CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "public"."Trade"("status");
      `);
    }

    console.log('\n✨ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.error('\nThis might be because:');
    console.error('1. DATABASE_URL environment variable is not set');
    console.error('2. Database is not accessible');
    console.error('3. Prisma client needs to be regenerated');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixDatabase()
  .catch(console.error);

