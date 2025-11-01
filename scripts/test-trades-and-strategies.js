// Configuration - Using built-in fetch (Node.js 18+)
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'd87d2c35-89f0-4f9b-bd66-db1309c1f2f6';

// Test data
const testTrade = {
  userId: TEST_USER_ID,
  symbol: 'AAPL',
  direction: 'Long',
  entryPrice: '150.50',
  exitPrice: '155.75',
  quantity: '100',
  entryDate: '2024-01-15',
  exitDate: '2024-01-16',
  strategy: 'Trend Following',
  duration: 'Intraday',
  notes: 'Test trade for API verification',
  psychology: {
    emotion: 'Confident',
    confidence: 8,
    stress: 2,
    notes: 'Good setup'
  },
  commission: 5.00
};

const testStrategy = {
  userId: TEST_USER_ID,
  name: `Test Strategy ${Date.now()}`, // Unique name to avoid conflicts
  description: 'A test strategy for verification',
  category: 'Breakout',
  rules: {
    entryCondition: 'Price above moving average',
    exitCondition: 'Take profit at 2R'
  },
  parameters: {
    movingAverage: 50,
    riskReward: 2
  }
};

async function testTrades() {
  console.log('\n📈 Testing Trades API\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Fetch all trades
    console.log('\n1️⃣ Testing GET /api/trades...');
    const fetchUrl = `${BASE_URL}/api/trades?userId=${TEST_USER_ID}`;
    console.log(`URL: ${fetchUrl}`);
    
    const fetchResponse = await fetch(fetchUrl);
    const fetchData = await fetchResponse.json();
    
    if (fetchResponse.ok) {
      console.log('✅ Fetch trades: SUCCESS');
      console.log(`   Found ${fetchData.trades?.length || 0} trades`);
    } else {
      console.log('❌ Fetch trades: FAILED');
      console.log('   Error:', fetchData.error);
      console.log('   Details:', fetchData.details);
    }
  } catch (error) {
    console.log('❌ Fetch trades: ERROR');
    console.log('   Error:', error.message);
  }

  // Test 2: Add a new trade
  console.log('\n2️⃣ Testing POST /api/trades...');
  try {
    const createResponse = await fetch(`${BASE_URL}/api/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTrade)
    });
    
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Create trade: SUCCESS');
      console.log('   Trade ID:', createData.trade?.id);
      console.log('   Symbol:', createData.trade?.symbol);
      console.log('   Direction:', createData.trade?.direction);
      console.log('   PnL:', createData.trade?.pnl);
    } else {
      console.log('❌ Create trade: FAILED');
      console.log('   Error:', createData.error);
      console.log('   Details:', createData.details);
    }
  } catch (error) {
    console.log('❌ Create trade: ERROR');
    console.log('   Error:', error.message);
  }

  // Test 3: Fetch again to verify the new trade
  console.log('\n3️⃣ Testing GET /api/trades after creation...');
  try {
    const verifyResponse = await fetch(`${BASE_URL}/api/trades?userId=${TEST_USER_ID}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ Verify trades: SUCCESS');
      console.log(`   Found ${verifyData.trades?.length || 0} trades total`);
      if (verifyData.trades?.length > 0) {
        const latestTrade = verifyData.trades[0];
        console.log('   Latest trade:');
        console.log(`     - ID: ${latestTrade.id}`);
        console.log(`     - Symbol: ${latestTrade.symbol}`);
        console.log(`     - Direction: ${latestTrade.direction}`);
        console.log(`     - Status: ${latestTrade.status}`);
      }
    } else {
      console.log('❌ Verify trades: FAILED');
      console.log('   Error:', verifyData.error);
    }
  } catch (error) {
    console.log('❌ Verify trades: ERROR');
    console.log('   Error:', error.message);
  }
}

async function testStrategies() {
  console.log('\n\n📊 Testing Strategies API\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Fetch all strategies
    console.log('\n1️⃣ Testing GET /api/strategies...');
    const fetchUrl = `${BASE_URL}/api/strategies?userId=${TEST_USER_ID}`;
    console.log(`URL: ${fetchUrl}`);
    
    const fetchResponse = await fetch(fetchUrl);
    const fetchData = await fetchResponse.json();
    
    if (fetchResponse.ok) {
      console.log('✅ Fetch strategies: SUCCESS');
      console.log(`   Found ${fetchData.strategies?.length || 0} strategies`);
      
      if (fetchData.strategies?.length > 0) {
        console.log('\n   Strategies:');
        fetchData.strategies.slice(0, 3).forEach((strategy, idx) => {
          console.log(`   ${idx + 1}. ${strategy.name} (${strategy.category})`);
        });
      }
    } else {
      console.log('❌ Fetch strategies: FAILED');
      console.log('   Error:', fetchData.error);
      console.log('   Details:', fetchData.details);
    }
  } catch (error) {
    console.log('❌ Fetch strategies: ERROR');
    console.log('   Error:', error.message);
  }

  // Test 2: Add a new strategy
  console.log('\n2️⃣ Testing POST /api/strategies...');
  try {
    const createResponse = await fetch(`${BASE_URL}/api/strategies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStrategy)
    });
    
    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Create strategy: SUCCESS');
      console.log('   Strategy ID:', createData.strategy?.id);
      console.log('   Name:', createData.strategy?.name);
      console.log('   Category:', createData.strategy?.category);
    } else {
      console.log('❌ Create strategy: FAILED');
      console.log('   Error:', createData.error);
      console.log('   Details:', createData.details);
    }
  } catch (error) {
    console.log('❌ Create strategy: ERROR');
    console.log('   Error:', error.message);
  }

  // Test 3: Fetch again to verify the new strategy
  console.log('\n3️⃣ Testing GET /api/strategies after creation...');
  try {
    const verifyResponse = await fetch(`${BASE_URL}/api/strategies?userId=${TEST_USER_ID}`);
    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok) {
      console.log('✅ Verify strategies: SUCCESS');
      console.log(`   Found ${verifyData.strategies?.length || 0} strategies total`);
      if (verifyData.strategies?.length > 0) {
        const latestStrategy = verifyData.strategies[0];
        console.log('   Latest strategy:');
        console.log(`     - ID: ${latestStrategy.id}`);
        console.log(`     - Name: ${latestStrategy.name}`);
        console.log(`     - Category: ${latestStrategy.category}`);
      }
    } else {
      console.log('❌ Verify strategies: FAILED');
      console.log('   Error:', verifyData.error);
    }
  } catch (error) {
    console.log('❌ Verify strategies: ERROR');
    console.log('   Error:', error.message);
  }
}

async function runAllTests() {
  console.log('\n🧪 Starting API Tests\n');
  console.log('═'.repeat(60));
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`User ID: ${TEST_USER_ID}`);
  console.log('═'.repeat(60));

  try {
    await testTrades();
    await testStrategies();
    
    console.log('\n\n✨ All tests completed!\n');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n\n❌ Test suite failed:', error);
    throw error;
  }
}

// Run the tests
runAllTests().catch(console.error);

