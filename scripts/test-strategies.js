const { PrismaClient } = require('@prisma/client')

async function testStrategies() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing Strategies Functionality...')
    
    // 1. Check if there are any users
    const users = await prisma.user.findMany({ take: 1 })
    console.log('👤 Users found:', users.length)
    
    if (users.length === 0) {
      console.log('❌ No users found. Creating a test user...')
      
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          auth_user_id: 'test-auth-id',
          firstName: 'Test',
          lastName: 'User',
          displayName: 'Test User'
        }
      })
      console.log('✅ Test user created:', testUser.id)
      
      // Test strategies API with the test user
      await testStrategiesAPI(testUser.id)
    } else {
      const userId = users[0].id
      console.log('✅ Using existing user:', userId)
      await testStrategiesAPI(userId)
    }
    
    // 2. Test creating a strategy
    console.log('\n📝 Testing strategy creation...')
    const testStrategy = await prisma.strategy.create({
      data: {
        userId: users[0]?.id || 'test-user-id',
        name: 'Test Strategy',
        description: 'A test strategy for validation',
        category: 'Breakout',
        rules: { entry: 'Break above resistance', exit: 'Stop loss at 2%' },
        parameters: { timeframe: '1h', risk: 1 }
      }
    })
    console.log('✅ Test strategy created:', testStrategy.id)
    
    // 3. Test fetching strategies
    console.log('\n📊 Testing strategy fetching...')
    const strategies = await prisma.strategy.findMany({
      where: { userId: users[0]?.id || 'test-user-id' },
      include: {
        trades: {
          select: {
            id: true,
            pnl: true,
            pnlPercent: true,
            status: true
          }
        }
      }
    })
    console.log('✅ Strategies fetched:', strategies.length)
    
    // 4. Test strategy statistics calculation
    console.log('\n📈 Testing strategy statistics...')
    strategies.forEach(strategy => {
      const trades = strategy.trades
      const totalTrades = trades.length
      const winningTrades = trades.filter(trade => trade.pnl > 0).length
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
      
      const totalProfit = trades.filter(trade => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0)
      const totalLoss = Math.abs(trades.filter(trade => trade.pnl < 0).reduce((sum, trade) => sum + trade.pnl, 0))
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0
      
      console.log(`Strategy: ${strategy.name}`)
      console.log(`  - Total Trades: ${totalTrades}`)
      console.log(`  - Win Rate: ${winRate.toFixed(1)}%`)
      console.log(`  - Profit Factor: ${profitFactor.toFixed(2)}`)
    })
    
    console.log('\n✅ Strategies test completed successfully!')
    
  } catch (error) {
    console.error('❌ Strategies test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testStrategiesAPI(userId) {
  try {
    console.log('\n🌐 Testing strategies API...')
    
    // Test GET request
    const response = await fetch(`http://localhost:3000/api/strategies?userId=${userId}`)
    if (response.ok) {
      const data = await response.json()
      console.log('✅ GET /api/strategies successful:', data.strategies?.length || 0, 'strategies')
    } else {
      console.log('⚠️ GET /api/strategies failed:', response.status, response.statusText)
    }
    
    // Test POST request
    const createResponse = await fetch('http://localhost:3000/api/strategies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name: 'API Test Strategy',
        description: 'Created via API test',
        category: 'Trend',
        rules: { entry: 'Price above MA', exit: 'Price below MA' },
        parameters: { ma_period: 20 }
      })
    })
    
    if (createResponse.ok) {
      const data = await createResponse.json()
      console.log('✅ POST /api/strategies successful:', data.strategy?.name)
    } else {
      console.log('⚠️ POST /api/strategies failed:', createResponse.status, createResponse.statusText)
    }
    
  } catch (error) {
    console.log('⚠️ API test failed (server might not be running):', error.message)
  }
}

testStrategies()
