const { PrismaClient } = require('@prisma/client')

async function runStepByStepMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Starting step-by-step long-term storage migration...')
    
    // Step 1: Create schemas
    console.log('\n📁 Step 1: Creating schemas...')
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS archive`
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS analytics`
    console.log('✅ Schemas created successfully')
    
    // Step 2: Create archive tables
    console.log('\n🗄️ Step 2: Creating archive tables...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS archive.archived_trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_trade_id UUID UNIQUE NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        entry_id VARCHAR(255) DEFAULT '',
        close_id VARCHAR(255) DEFAULT '',
        instrument VARCHAR(255) NOT NULL,
        entry_price VARCHAR(255) NOT NULL,
        close_price VARCHAR(255) NOT NULL,
        entry_date VARCHAR(255) NOT NULL,
        close_date VARCHAR(255) NOT NULL,
        pnl FLOAT NOT NULL,
        time_in_position FLOAT DEFAULT 0,
        user_id VARCHAR(255) NOT NULL,
        side VARCHAR(255) DEFAULT '',
        commission FLOAT DEFAULT 0,
        original_created_at TIMESTAMP NOT NULL,
        archived_at TIMESTAMP DEFAULT NOW(),
        comment TEXT,
        video_url TEXT,
        tags TEXT[] DEFAULT '{}',
        image_base64 TEXT,
        image_base64_second TEXT,
        group_id VARCHAR(255) DEFAULT '',
        symbol VARCHAR(255),
        direction VARCHAR(255),
        strategy VARCHAR(255),
        duration VARCHAR(255),
        status VARCHAR(255),
        pnl_percent FLOAT,
        notes TEXT,
        psychology JSONB,
        archive_reason VARCHAR(255) DEFAULT 'AUTOMATIC',
        data_version INTEGER DEFAULT 1,
        compression_ratio FLOAT
      )
    `
    console.log('✅ Archived trades table created')
    
    // Step 3: Create analytics tables
    console.log('\n📊 Step 3: Creating analytics tables...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS analytics.daily_trading_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        total_trades INTEGER DEFAULT 0,
        total_pnl FLOAT DEFAULT 0,
        total_commission FLOAT DEFAULT 0,
        net_pnl FLOAT DEFAULT 0,
        win_rate FLOAT DEFAULT 0,
        profit_factor FLOAT DEFAULT 0,
        max_drawdown FLOAT DEFAULT 0,
        max_profit FLOAT DEFAULT 0,
        avg_time_in_position FLOAT DEFAULT 0,
        long_trades INTEGER DEFAULT 0,
        short_trades INTEGER DEFAULT 0,
        winning_trades INTEGER DEFAULT 0,
        losing_trades INTEGER DEFAULT 0,
        account_breakdown JSONB,
        strategy_breakdown JSONB,
        hourly_breakdown JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `
    console.log('✅ Daily trading summary table created')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS analytics.weekly_trading_summary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        total_trades INTEGER DEFAULT 0,
        total_pnl FLOAT DEFAULT 0,
        total_commission FLOAT DEFAULT 0,
        net_pnl FLOAT DEFAULT 0,
        win_rate FLOAT DEFAULT 0,
        profit_factor FLOAT DEFAULT 0,
        max_drawdown FLOAT DEFAULT 0,
        max_profit FLOAT DEFAULT 0,
        avg_time_in_position FLOAT DEFAULT 0,
        long_trades INTEGER DEFAULT 0,
        short_trades INTEGER DEFAULT 0,
        winning_trades INTEGER DEFAULT 0,
        losing_trades INTEGER DEFAULT 0,
        daily_breakdown JSONB,
        account_breakdown JSONB,
        strategy_breakdown JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, week_start)
      )
    `
    console.log('✅ Weekly trading summary table created')
    
    // Step 4: Create retention policy tables
    console.log('\n⚙️ Step 4: Creating retention policy tables...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS data_retention_policy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(255) UNIQUE NOT NULL,
        retention_days INTEGER NOT NULL,
        archive_days INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_run_at TIMESTAMP,
        next_run_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Data retention policy table created')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS archive_job (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(255) NOT NULL,
        records_processed INTEGER DEFAULT 0,
        records_archived INTEGER DEFAULT 0,
        records_deleted INTEGER DEFAULT 0,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        status VARCHAR(50) DEFAULT 'RUNNING',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log('✅ Archive job table created')
    
    // Step 5: Add columns to existing tables
    console.log('\n🔧 Step 5: Adding columns to existing tables...')
    
    try {
      await prisma.$executeRaw`ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`
      console.log('✅ Added is_archived to Trade table')
    } catch (e) {
      console.log('⚠️  is_archived column may already exist in Trade table')
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP`
      console.log('✅ Added archived_at to Trade table')
    } catch (e) {
      console.log('⚠️  archived_at column may already exist in Trade table')
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS data_version INTEGER DEFAULT 1`
      console.log('✅ Added data_version to Trade table')
    } catch (e) {
      console.log('⚠️  data_version column may already exist in Trade table')
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 365`
      console.log('✅ Added data_retention_days to User table')
    } catch (e) {
      console.log('⚠️  data_retention_days column may already exist in User table')
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS archive_retention_days INTEGER DEFAULT 2555`
      console.log('✅ Added archive_retention_days to User table')
    } catch (e) {
      console.log('⚠️  archive_retention_days column may already exist in User table')
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS auto_archive_enabled BOOLEAN DEFAULT true`
      console.log('✅ Added auto_archive_enabled to User table')
    } catch (e) {
      console.log('⚠️  auto_archive_enabled column may already exist in User table')
    }
    
    // Step 6: Create indexes
    console.log('\n📈 Step 6: Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_archived_trades_user_id ON archive.archived_trades(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_archived_trades_account_number ON archive.archived_trades(account_number)',
      'CREATE INDEX IF NOT EXISTS idx_archived_trades_entry_date ON archive.archived_trades(entry_date)',
      'CREATE INDEX IF NOT EXISTS idx_archived_trades_archived_at ON archive.archived_trades(archived_at)',
      'CREATE INDEX IF NOT EXISTS idx_daily_summary_user_id ON analytics.daily_trading_summary(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON analytics.daily_trading_summary(date)',
      'CREATE INDEX IF NOT EXISTS idx_weekly_summary_user_id ON analytics.weekly_trading_summary(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_weekly_summary_week_start ON analytics.weekly_trading_summary(week_start)',
      'CREATE INDEX IF NOT EXISTS idx_trades_is_archived ON "Trade"(is_archived)',
      'CREATE INDEX IF NOT EXISTS idx_trades_archived_at ON "Trade"(archived_at)',
      'CREATE INDEX IF NOT EXISTS idx_trades_created_at ON "Trade"(created_at)'
    ]
    
    for (const indexSql of indexes) {
      try {
        await prisma.$executeRawUnsafe(indexSql)
        console.log(`✅ Created index: ${indexSql.split(' ')[5]}`)
      } catch (e) {
        console.log(`⚠️  Index may already exist: ${indexSql.split(' ')[5]}`)
      }
    }
    
    // Step 7: Insert default retention policies
    console.log('\n📋 Step 7: Inserting default retention policies...')
    
    const policies = [
      { table_name: 'trades', retention_days: 365, archive_days: 2555 },
      { table_name: 'tradeAnalytics', retention_days: 365, archive_days: 2555 },
      { table_name: 'historicalData', retention_days: 90, archive_days: 630 },
      { table_name: 'moods', retention_days: 2555, archive_days: 2555 },
      { table_name: 'archivedTrades', retention_days: 2555, archive_days: 0 },
      { table_name: 'notifications', retention_days: 30, archive_days: 0 },
      { table_name: 'orders', retention_days: 365, archive_days: 2555 },
      { table_name: 'payouts', retention_days: 2555, archive_days: 0 }
    ]
    
    for (const policy of policies) {
      try {
        await prisma.$executeRaw`
          INSERT INTO data_retention_policy (table_name, retention_days, archive_days, next_run_at) 
          VALUES (${policy.table_name}, ${policy.retention_days}, ${policy.archive_days}, NOW() + INTERVAL '1 day')
          ON CONFLICT (table_name) DO NOTHING
        `
        console.log(`✅ Inserted policy for ${policy.table_name}`)
      } catch (e) {
        console.log(`⚠️  Policy for ${policy.table_name} may already exist`)
      }
    }
    
    // Step 8: Verify migration
    console.log('\n🔍 Step 8: Verifying migration...')
    
    const archiveTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'archive'
    `
    
    const analyticsTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'analytics'
    `
    
    console.log('📊 Archive tables:', archiveTables)
    console.log('📊 Analytics tables:', analyticsTables)
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Update your Prisma schema to include the new tables')
    console.log('2. Run `npx prisma generate` to update the Prisma client')
    console.log('3. Test the data retention settings in your dashboard')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runStepByStepMigration()
