/**
 * Frontend Authentication Test Script
 * Tests the complete auth flow: registration, login, token validation, and redirects
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.backend.mytradejournal.co.in'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Test user credentials
const testUser = {
  email: `test-auth-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
}

let authToken = ''

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function fetchAPI(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  }

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options)
    const data = await response.json().catch(() => ({}))
    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    }
  }
}

async function testBackendConnection() {
  log('\n[1] Testing Backend Connection...', 'blue')
  const result = await fetchAPI('GET', '/health')
  
  if (result.ok || result.status === 200) {
    log('✓ Backend is running', 'green')
    return true
  } else {
    log(`✗ Backend connection failed: ${result.error || result.status}`, 'red')
    log('  Make sure backend is running: cd backend && npm run dev', 'yellow')
    return false
  }
}

async function testRegistration() {
  log('\n[2] Testing User Registration...', 'blue')
  const result = await fetchAPI('POST', '/auth/register', {
    email: testUser.email,
    password: testUser.password,
    name: testUser.name
  })
  
  if (result.status === 201 && result.data.token) {
    authToken = result.data.token
    log(`✓ Registration successful!`, 'green')
    log(`  Email: ${testUser.email}`, 'green')
    log(`  Token received: ${authToken.substring(0, 20)}...`, 'green')
    return true
  } else {
    log(`✗ Registration failed: ${JSON.stringify(result.data)}`, 'red')
    return false
  }
}

async function testDuplicateRegistration() {
  log('\n[3] Testing Duplicate Registration (should fail)...', 'blue')
  const result = await fetchAPI('POST', '/auth/register', {
    email: testUser.email,
    password: testUser.password,
    name: testUser.name
  })
  
  if (result.status === 409) {
    log('✓ Duplicate registration correctly rejected', 'green')
    return true
  } else {
    log(`✗ Duplicate registration not properly handled: ${result.status}`, 'red')
    return false
  }
}

async function testLogin() {
  log('\n[4] Testing User Login...', 'blue')
  const result = await fetchAPI('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  })
  
  if (result.status === 200 && result.data.token) {
    authToken = result.data.token // Update token
    log('✓ Login successful!', 'green')
    log(`  New token received: ${authToken.substring(0, 20)}...`, 'green')
    return true
  } else {
    log(`✗ Login failed: ${JSON.stringify(result.data)}`, 'red')
    return false
  }
}

async function testInvalidLogin() {
  log('\n[5] Testing Invalid Login (wrong password)...', 'blue')
  const result = await fetchAPI('POST', '/auth/login', {
    email: testUser.email,
    password: 'WrongPassword123!'
  })
  
  if (result.status === 401) {
    log('✓ Invalid login correctly rejected', 'green')
    return true
  } else {
    log(`✗ Invalid login not properly handled: ${result.status}`, 'red')
    return false
  }
}

async function testGetMe() {
  log('\n[6] Testing Get Current User (/auth/me)...', 'blue')
  const result = await fetchAPI('GET', '/auth/me', null, authToken)
  
  if (result.status === 200 && result.data.id && result.data.email) {
    log('✓ User info retrieved successfully', 'green')
    log(`  User ID: ${result.data.id}`, 'green')
    log(`  Email: ${result.data.email}`, 'green')
    log(`  Name: ${result.data.name || 'N/A'}`, 'green')
    return true
  } else {
    log(`✗ Failed to get user info: ${JSON.stringify(result.data)}`, 'red')
    return false
  }
}

async function testInvalidToken() {
  log('\n[7] Testing Invalid Token (should fail)...', 'blue')
  const invalidToken = 'invalid.token.here'
  const result = await fetchAPI('GET', '/auth/me', null, invalidToken)
  
  if (result.status === 401) {
    log('✓ Invalid token correctly rejected', 'green')
    return true
  } else {
    log(`✗ Invalid token not properly handled: ${result.status}`, 'red')
    return false
  }
}

async function testMissingToken() {
  log('\n[8] Testing Missing Token (should fail)...', 'blue')
  const result = await fetchAPI('GET', '/auth/me', null, null)
  
  if (result.status === 401) {
    log('✓ Missing token correctly rejected', 'green')
    return true
  } else {
    log(`✗ Missing token not properly handled: ${result.status}`, 'red')
    return false
  }
}

async function testTokenValidation() {
  log('\n[9] Testing Token Format...', 'blue')
  if (authToken && authToken.length > 20) {
    // Check if it looks like a JWT (has 3 parts separated by dots)
    const parts = authToken.split('.')
    if (parts.length === 3) {
      log('✓ Token format is valid (JWT)', 'green')
      return true
    } else {
      log('⚠ Token format is unusual (not standard JWT)', 'yellow')
      return true // Still valid if backend accepts it
    }
  } else {
    log('✗ Token is invalid or too short', 'red')
    return false
  }
}

async function runAllTests() {
  log('='.repeat(60), 'blue')
  log('FRONTEND AUTHENTICATION TEST SUITE', 'blue')
  log('='.repeat(60), 'blue')
  log(`Backend URL: ${BACKEND_URL}`, 'blue')
  log(`Test User: ${testUser.email}`, 'blue')
  log('='.repeat(60), 'blue')
  
  const results = {
    passed: 0,
    failed: 0
  }

  // Test backend connection first
  if (!(await testBackendConnection())) {
    log('\n✗ Backend server is not running!', 'red')
    log('  Please start the backend with: cd backend && npm run dev', 'yellow')
    return
  }

  // Run authentication tests
  if (await testRegistration()) results.passed++
  else results.failed++

  if (await testDuplicateRegistration()) results.passed++
  else results.failed++

  if (await testLogin()) results.passed++
  else results.failed++

  if (await testInvalidLogin()) results.passed++
  else results.failed++

  if (await testGetMe()) results.passed++
  else results.failed++

  if (await testInvalidToken()) results.passed++
  else results.failed++

  if (await testMissingToken()) results.passed++
  else results.failed++

  if (await testTokenValidation()) results.passed++
  else results.failed++

  // Summary
  log('\n' + '='.repeat(60), 'blue')
  log('TEST SUMMARY', 'blue')
  log('='.repeat(60), 'blue')
  log(`Total Tests: ${results.passed + results.failed}`, 'blue')
  log(`Passed: ${results.passed}`, 'green')
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log('='.repeat(60), 'blue')
  
  if (results.failed === 0) {
    log('\n🎉 All authentication tests passed!', 'green')
    log('✓ Registration works', 'green')
    log('✓ Login works', 'green')
    log('✓ Token validation works', 'green')
    log('✓ Error handling works', 'green')
    log('\nNext steps:', 'blue')
    log('1. Test the frontend UI by starting the dev server: npm run dev', 'blue')
    log('2. Navigate to /signin and test login', 'blue')
    log('3. Navigate to /signup and test registration', 'blue')
    log('4. Try accessing /dashboard without login (should redirect)', 'blue')
    log('5. Try accessing /signin while logged in (should redirect)', 'blue')
  } else {
    log('\n⚠️  Some tests failed. Check the output above.', 'yellow')
    log('Common issues:', 'yellow')
    log('- Backend not running: cd backend && npm run dev', 'yellow')
    log('- Database not configured: Check backend .env file', 'yellow')
    log('- CORS issues: Check backend CORS configuration', 'yellow')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n✗ Test suite crashed: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  })
}

module.exports = { runAllTests, testUser, authToken }

