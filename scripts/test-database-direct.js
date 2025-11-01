const { Client } = require('pg')
require('dotenv').config()

async function testDatabaseDirect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })
  
  try {
    await client.connect()
    console.log('🧪 Testing Database Directly...')
    
    // 1. Test User table
    console.log('\n👤 Testing User table...')
    const userResult = await client.query('SELECT id, email FROM "User" LIMIT 1')
    console.log('✅ Users found:', userResult.rows.length)
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Creating a test user...')
      const insertResult = await client.query(`
        INSERT INTO "User" (id, email, "auth_user_id", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'test@example.com', 'test-auth-id', NOW(), NOW())
        RETURNING id
      `)
      console.log('✅ Test user created:', insertResult.rows[0].id)
    }
    
    // 2. Test Strategy table
    console.log('\n📝 Testing Strategy table...')
    const strategyResult = await client.query('SELECT id, name, category FROM "Strategy" LIMIT 5')
    console.log('✅ Strategies found:', strategyResult.rows.length)
    
    // 3. Test Trade table
    console.log('\n💰 Testing Trade table...')
    const tradeResult = await client.query('SELECT id, "accountNumber", pnl, "entryDate" FROM "Trade" LIMIT 5')
    console.log('✅ Trades found:', tradeResult.rows.length)
    
    // 4. Test creating a test strategy
    console.log('\n🔧 Creating test strategy...')
    const userId = userResult.rows[0]?.id || (await client.query('SELECT id FROM "User" LIMIT 1')).rows[0].id
    
    try {
      const strategyInsert = await client.query(`
        INSERT INTO "Strategy" (id, "userId", name, description, category, rules, parameters, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, 'Test Strategy 2', 'Another test strategy for validation', 'Trend', '{"entry": "Price above MA"}', '{"ma_period": 20}', true, NOW(), NOW())
        RETURNING id, name
      `, [userId])
      
      console.log('✅ Test strategy created:', strategyInsert.rows[0].name)
    } catch (error) {
      if (error.code === '23505') {
        console.log('⚠️ Test strategy already exists, continuing with existing data...')
      } else {
        throw error
      }
    }
    
    // 5. Test fetching strategies with stats
    console.log('\n📊 Testing strategy statistics...')
    const strategiesWithStats = await client.query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.category,
        COUNT(t.id) as total_trades,
        COUNT(CASE WHEN t.pnl > 0 THEN 1 END) as winning_trades,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(SUM(CASE WHEN t.pnl > 0 THEN t.pnl ELSE 0 END), 0) as total_profit,
        COALESCE(SUM(CASE WHEN t.pnl < 0 THEN ABS(t.pnl) ELSE 0 END), 0) as total_loss
      FROM "Strategy" s
      LEFT JOIN "Trade" t ON s.id = t.strategy
      WHERE s."userId" = $1
      GROUP BY s.id, s.name, s.description, s.category
      ORDER BY s."createdAt" DESC
    `, [userId])
    
    console.log('✅ Strategies with stats:', strategiesWithStats.rows.length)
    strategiesWithStats.rows.forEach(strategy => {
      const winRate = strategy.total_trades > 0 ? (strategy.winning_trades / strategy.total_trades) * 100 : 0
      const profitFactor = strategy.total_loss > 0 ? strategy.total_profit / strategy.total_loss : strategy.total_profit > 0 ? 999 : 0
      
      console.log(`  - ${strategy.name}: ${strategy.total_trades} trades, ${winRate.toFixed(1)}% win rate, ${profitFactor.toFixed(2)} profit factor`)
    })
    
    // 6. Test calendar data aggregation
    console.log('\n📅 Testing calendar data aggregation...')
    const calendarData = await client.query(`
      SELECT 
        "entryDate" as date,
        COUNT(*) as total_trades,
        SUM(pnl) as total_pnl,
        SUM(commission) as total_commission,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
        AVG("timeInPosition") as avg_time_in_position
      FROM "Trade"
      WHERE "userId" = $1
      GROUP BY "entryDate"
      ORDER BY "entryDate" DESC
      LIMIT 10
    `, [userId])
    
    console.log('✅ Calendar data:', calendarData.rows.length, 'days')
    calendarData.rows.forEach(day => {
      const winRate = day.total_trades > 0 ? (day.winning_trades / day.total_trades) * 100 : 0
      console.log(`  - ${day.date}: ${day.total_trades} trades, $${day.total_pnl.toFixed(2)} P&L, ${winRate.toFixed(1)}% win rate`)
    })
    
    console.log('\n✅ Database direct test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await client.end()
  }
}

testDatabaseDirect()
