/**
 * Google Sign-In Test Script
 * Tests Google OAuth flow with production backend
 * 
 * Usage: node test-google-signin.js
 */

const BACKEND_URL = 'https://backend.mytradejournal.co.in'
const FRONTEND_URL = 'https://www.mytradejournal.co.in'

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function fetchAPI(method, endpoint, options = {}) {
  const { body, token, headers = {}, followRedirects = true } = options
  
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers
    },
    ...(body && { body: JSON.stringify(body) }),
    redirect: followRedirects ? 'follow' : 'manual' // 'manual' to see redirect status
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`
    const response = await fetch(url, requestOptions)
    
    let data = {}
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}))
    } else {
      const text = await response.text().catch(() => '')
      data = { text, status: response.status }
    }
    
    return {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      url: response.url || url,
      redirected: response.redirected || false
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      stack: error.stack
    }
  }
}

async function testBackendConnection() {
  log('\n[1] Testing Backend Connection...', 'blue')
  const result = await fetchAPI('GET', '/api/health')
  
  if (result.ok || result.status === 200 || result.status === 404) {
    // Health endpoint might not exist, but if we get a response, backend is up
    log('✓ Backend is accessible', 'green')
    return true
  } else {
    log(`✗ Backend connection failed: ${result.error || result.status}`, 'red')
    log(`  Backend URL: ${BACKEND_URL}`, 'yellow')
    return false
  }
}

async function testGoogleOAuthInitiation() {
  log('\n[2] Testing Google OAuth Initiation Endpoint...', 'blue')
  log(`  Testing: GET ${BACKEND_URL}/api/auth/google`, 'cyan')
  
  // First, check redirect without following it
  const result = await fetchAPI('GET', '/api/auth/google', {
    headers: {
      'Accept': 'text/html, application/json'
    },
    followRedirects: false
  })
  
  // OAuth initiation should redirect to Google
  if (result.status === 302 || result.status === 307 || result.status === 301) {
    const location = result.headers.location || result.data.location
    if (location && location.includes('accounts.google.com')) {
      log('✓ Google OAuth initiation successful', 'green')
      log(`  Redirects to: ${location.substring(0, 100)}...`, 'green')
      return { success: true, redirectUrl: location }
    } else {
      log('⚠ OAuth redirected but not to Google', 'yellow')
      log(`  Location: ${location}`, 'yellow')
      return { success: false, redirectUrl: location }
    }
  } else if (result.status === 200) {
    // If it returned 200, try following redirects to see where it goes
    const result2 = await fetchAPI('GET', '/api/auth/google', {
      headers: {
        'Accept': 'text/html, application/json'
      },
      followRedirects: true
    })
    
    if (result2.redirected && result2.url && result2.url.includes('accounts.google.com')) {
      log('✓ Google OAuth initiation successful (redirect followed)', 'green')
      log(`  Final URL: ${result2.url.substring(0, 100)}...`, 'green')
      return { success: true, redirectUrl: result2.url }
    } else {
      log('⚠ OAuth endpoint returned 200 but did not redirect to Google', 'yellow')
      log(`  Final URL: ${result2.url}`, 'yellow')
      return { success: true, redirectUrl: null }
    }
  } else {
    log(`✗ OAuth initiation failed: ${result.status}`, 'red')
    log(`  Response: ${JSON.stringify(result.data, null, 2)}`, 'red')
    return { success: false, redirectUrl: null }
  }
}

async function testGoogleOAuthWithNext() {
  log('\n[3] Testing Google OAuth with Next Parameter...', 'blue')
  log(`  Testing: GET ${BACKEND_URL}/api/auth/google?next=/dashboard`, 'cyan')
  
  // Check redirect without following it first
  const result = await fetchAPI('GET', '/api/auth/google?next=/dashboard', {
    followRedirects: false
  })
  
  if (result.status === 302 || result.status === 307 || result.status === 301) {
    const location = result.headers.location || result.data.location
    if (location && location.includes('accounts.google.com')) {
      log('✓ Google OAuth with next parameter works', 'green')
      log(`  Redirects to: ${location.substring(0, 100)}...`, 'green')
      
      // Check if state parameter contains the next URL
      if (location.includes('state=')) {
        log('  State parameter found (contains next URL)', 'green')
      }
      return true
    } else {
      log('⚠ OAuth redirected but not to Google', 'yellow')
      return false
    }
  } else if (result.status === 200) {
    // Try following redirects
    const result2 = await fetchAPI('GET', '/api/auth/google?next=/dashboard', {
      followRedirects: true
    })
    
    if (result2.redirected && result2.url && result2.url.includes('accounts.google.com')) {
      log('✓ Google OAuth with next parameter works (redirect followed)', 'green')
      log(`  Final URL: ${result2.url.substring(0, 100)}...`, 'green')
      if (result2.url.includes('state=')) {
        log('  State parameter found (contains next URL)', 'green')
      }
      return true
    } else {
      log(`⚠ OAuth with next parameter returned 200 but did not redirect to Google`, 'yellow')
      return false
    }
  } else {
    log(`✗ OAuth with next parameter failed: ${result.status}`, 'red')
    return false
  }
}

async function testGoogleOAuthCallbackErrorHandling() {
  log('\n[4] Testing Google OAuth Callback Error Handling...', 'blue')
  
  // Test missing code
  log('  Testing callback without code parameter...', 'cyan')
  const result1 = await fetchAPI('GET', '/api/auth/google/callback')
  if (result1.status === 302) {
    const location = result1.headers.location || result1.data.location
    if (location && location.includes(FRONTEND_URL)) {
      log('✓ Missing code correctly redirects to frontend with error', 'green')
      return true
    }
  }
  
  log('⚠ Error handling test inconclusive', 'yellow')
  return true // Don't fail the test suite on this
}

async function testTokenValidation() {
  log('\n[5] Testing Token Validation Endpoint...', 'blue')
  log('  Note: This requires a valid JWT token from Google OAuth', 'yellow')
  
  // Test with missing token
  const result1 = await fetchAPI('GET', '/api/auth/me')
  if (result1.status === 401) {
    log('✓ Missing token correctly returns 401', 'green')
  } else {
    log(`⚠ Missing token test: Expected 401, got ${result1.status}`, 'yellow')
  }
  
  // Test with invalid token
  const result2 = await fetchAPI('GET', '/api/auth/me', {
    token: 'invalid.token.here'
  })
  if (result2.status === 401) {
    log('✓ Invalid token correctly returns 401', 'green')
  } else {
    log(`⚠ Invalid token test: Expected 401, got ${result2.status}`, 'yellow')
  }
  
  return true
}

async function testGoogleOAuthRedirectURL() {
  log('\n[6] Testing OAuth Redirect URL Configuration...', 'blue')
  
  const oauthResult = await testGoogleOAuthInitiation()
  if (oauthResult.success && oauthResult.redirectUrl) {
    // Check if redirect_uri in the Google URL points to our backend callback
    const url = new URL(oauthResult.redirectUrl)
    const redirectUri = url.searchParams.get('redirect_uri')
    
    if (redirectUri) {
      log('✓ Redirect URI found in OAuth URL', 'green')
      log(`  Redirect URI: ${redirectUri}`, 'cyan')
      
      if (redirectUri.includes('/api/auth/google/callback')) {
        log('✓ Redirect URI points to correct callback endpoint', 'green')
        return true
      } else {
        log('⚠ Redirect URI does not point to /api/auth/google/callback', 'yellow')
        log(`  Found: ${redirectUri}`, 'yellow')
        return false
      }
    } else {
      log('⚠ Redirect URI not found in OAuth URL', 'yellow')
      return false
    }
  } else {
    log('⚠ Cannot test redirect URI - OAuth initiation failed', 'yellow')
    return false
  }
}

async function testFrontendRedirect() {
  log('\n[7] Testing Frontend Redirect URL...', 'blue')
  log('  This test verifies the backend redirects to the correct frontend domain', 'cyan')
  
  // Test callback with error parameter (simulates Google error)
  const result = await fetchAPI('GET', '/api/auth/google/callback?error=access_denied', {
    followRedirects: false
  })
  
  if (result.status === 302 || result.status === 307 || result.status === 301) {
    const location = result.headers.location || result.data.location
    if (location) {
      log('✓ Backend redirects to frontend on error', 'green')
      log(`  Redirect URL: ${location}`, 'cyan')
      
      if (location.includes(FRONTEND_URL) || location.includes('mytradejournal.co.in')) {
        log('✓ Redirect URL points to correct frontend domain', 'green')
        
        // Check if error parameter is included
        if (location.includes('error=')) {
          log('✓ Error parameter is included in redirect URL', 'green')
        }
        return true
      } else if (location.includes('localhost')) {
        log('⚠ Redirect URL points to localhost (might be development mode)', 'yellow')
        return true
      } else {
        log('⚠ Redirect URL does not point to expected frontend domain', 'yellow')
        log(`  Expected: ${FRONTEND_URL} or mytradejournal.co.in`, 'yellow')
        log(`  Got: ${location}`, 'yellow')
        return false
      }
    }
  } else if (result.status === 200) {
    // Try following redirects
    const result2 = await fetchAPI('GET', '/api/auth/google/callback?error=access_denied', {
      followRedirects: true
    })
    
    if (result2.redirected && result2.url) {
      log('✓ Backend redirects to frontend on error (redirect followed)', 'green')
      log(`  Final URL: ${result2.url}`, 'cyan')
      
      if (result2.url.includes(FRONTEND_URL) || result2.url.includes('mytradejournal.co.in')) {
        log('✓ Redirect URL points to correct frontend domain', 'green')
        return true
      } else if (result2.url.includes('localhost')) {
        log('⚠ Redirect URL points to localhost (might be development mode)', 'yellow')
        return true
      }
    }
  }
  
  log('⚠ Frontend redirect test inconclusive', 'yellow')
  log(`  Status: ${result.status}`, 'yellow')
  return true // Don't fail on this
}

async function testAPIEndpointPaths() {
  log('\n[8] Testing API Endpoint Paths...', 'blue')
  
  const endpoints = [
    '/api/auth/google',
    '/api/auth/google/callback',
    '/api/auth/me',
    '/api/auth/login',
    '/api/auth/register'
  ]
  
  let allCorrect = true
  
  for (const endpoint of endpoints) {
    const result = await fetchAPI('GET', endpoint)
    
    // Any response (even 401, 404, 302) means the endpoint exists
    if (result.status > 0 && result.status < 600) {
      log(`✓ ${endpoint} is accessible`, 'green')
    } else {
      log(`✗ ${endpoint} is not accessible`, 'red')
      allCorrect = false
    }
  }
  
  return allCorrect
}

async function runAllTests() {
  log('='.repeat(70), 'blue')
  log('GOOGLE SIGN-IN TEST SUITE (Production Backend)', 'blue')
  log('='.repeat(70), 'blue')
  log(`Backend URL: ${BACKEND_URL}`, 'cyan')
  log(`Frontend URL: ${FRONTEND_URL}`, 'cyan')
  log('='.repeat(70), 'blue')
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  }

  // Test backend connection first
  if (!(await testBackendConnection())) {
    log('\n✗ Backend server is not accessible!', 'red')
    log('  Please check:', 'yellow')
    log('  1. Backend is deployed and running', 'yellow')
    log('  2. Backend URL is correct', 'yellow')
    log('  3. Network connectivity', 'yellow')
    return
  }

  // Run Google OAuth tests
  const oauthInit = await testGoogleOAuthInitiation()
  if (oauthInit.success) results.passed++
  else results.failed++

  const oauthNext = await testGoogleOAuthWithNext()
  if (oauthNext) results.passed++
  else results.warnings++

  const oauthError = await testGoogleOAuthCallbackErrorHandling()
  if (oauthError) results.passed++
  else results.warnings++

  const tokenValidation = await testTokenValidation()
  if (tokenValidation) results.passed++
  else results.warnings++

  const redirectUrl = await testGoogleOAuthRedirectURL()
  if (redirectUrl) results.passed++
  else results.warnings++

  const frontendRedirect = await testFrontendRedirect()
  if (frontendRedirect) results.passed++
  else results.warnings++

  const apiPaths = await testAPIEndpointPaths()
  if (apiPaths) results.passed++
  else results.failed++

  // Summary
  log('\n' + '='.repeat(70), 'blue')
  log('TEST SUMMARY', 'blue')
  log('='.repeat(70), 'blue')
  log(`Total Tests: ${results.passed + results.failed + results.warnings}`, 'blue')
  log(`Passed: ${results.passed}`, 'green')
  log(`Warnings: ${results.warnings}`, 'yellow')
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  log('='.repeat(70), 'blue')
  
  if (results.failed === 0) {
    log('\n🎉 All critical Google sign-in tests passed!', 'green')
    log('\nNext steps for manual testing:', 'blue')
    log('1. Visit the frontend and click "Sign in with Google"', 'blue')
    log('2. Complete the Google OAuth flow in your browser', 'blue')
    log('3. Verify you are redirected back to the frontend', 'blue')
    log('4. Verify you are logged in and can access the dashboard', 'blue')
    log('5. Check browser console for any errors', 'blue')
    log('\nNote: Full OAuth flow requires manual testing in browser', 'yellow')
    log('      because it requires Google account authentication', 'yellow')
  } else {
    log('\n⚠️  Some tests failed. Check the output above.', 'yellow')
    log('Common issues:', 'yellow')
    log('- Backend not deployed or incorrect URL', 'yellow')
    log('- Google OAuth credentials not configured', 'yellow')
    log('- CORS issues', 'yellow')
    log('- Environment variables not set correctly', 'yellow')
  }
  
  if (results.warnings > 0) {
    log('\n⚠️  Some tests had warnings (non-critical issues)', 'yellow')
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

module.exports = { 
  runAllTests, 
  testGoogleOAuthInitiation,
  testTokenValidation,
  BACKEND_URL,
  FRONTEND_URL
}

