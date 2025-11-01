// Test frontend pages - using built-in fetch

async function testFrontend() {
  console.log('\n🌐 Testing Frontend Pages\n');
  console.log('═'.repeat(60));

  const pages = [
    'http://localhost:3000/dashboard/trades',
    'http://localhost:3000/dashboard/strategies',
    'http://localhost:3000/dashboard',
  ];

  for (const page of pages) {
    try {
      const response = await fetch(page, { redirect: 'manual' });
      const status = response.status;
      const isRedirect = status >= 300 && status < 400;
      
      if (status === 200) {
        const html = await response.text();
        const hasReactContent = html.includes('__NEXT_DATA__');
        const pageName = page.split('/').pop();
        
        console.log(`✅ ${pageName.padEnd(20)} - Status: ${status} - ${hasReactContent ? 'Has React content' : 'No React content'}`);
        
        // Check for specific content
        if (page.includes('trades') && html.includes('trades')) {
          console.log(`   ✓ Trades page content found`);
        }
        if (page.includes('strategies') && html.includes('strategy')) {
          console.log(`   ✓ Strategies page content found`);
        }
      } else if (isRedirect) {
        console.log(`⚠️  ${page.padEnd(20)} - Status: ${status} (Redirect - may need auth)`);
      } else {
        console.log(`❌ ${page.padEnd(20)} - Status: ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${page.padEnd(20)} - Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Frontend tests completed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Open http://localhost:3000/dashboard/trades in your browser');
  console.log('   2. Open http://localhost:3000/dashboard/strategies in your browser');
  console.log('   3. Try adding a new trade or strategy');
  console.log('');
}

testFrontend().catch(console.error);

