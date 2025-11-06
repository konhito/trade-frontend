import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const backendBaseUrl = 'https://trade-backend-production-b0a3.up.railway.app'

// Allow up to 60 seconds for AI generation
export const maxDuration = 60

// Helper to get auth token from cookies or headers
async function getAuthToken(req: Request): Promise<string | null> {
  // Try to get from Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  
  // Try to get from cookies
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (token) return token
  
  return null
}

// Helper to get user from cookies or backend
async function getAuthenticatedUser(req: Request): Promise<{ id: string | number; email?: string } | null> {
  // First try to get token from Authorization header or cookies
  const authToken = await getAuthToken(req)
  if (!authToken) {
    // No token available at all
    return null
  }
  
  // Try to get from cookies first (faster, if available)
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  const userEmail = cookieStore.get('user_email')?.value
  const cookieToken = cookieStore.get('auth_token')?.value
  
  // If we have userId from cookies and tokens match, use cookie data
  if (userId && cookieToken && cookieToken === authToken) {
    return {
      id: userId,
      email: userEmail || undefined
    }
  }
  
  // Fallback: verify token with backend to get user info
  try {
    const res = await fetch(`${backendBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (!res.ok) {
      console.error('[AI Summarize] Backend auth/me failed:', res.status, res.statusText)
      return null
    }
    const userData = await res.json()
    return userData
  } catch (error) {
    console.error('[AI Summarize] Error verifying token with backend:', error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { type, userData } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Get authenticated user (from cookies or backend)
    const user = await getAuthenticatedUser(req)
    console.log('[AI Summarize] Authenticated user:', user ? { id: user.id, email: user.email } : 'null')
    
    if (!user || !user.id) {
      console.error('[AI Summarize] No authenticated user found')
      // Check what we have in cookies for debugging
      const cookieStore = await cookies()
      const userId = cookieStore.get('user_id')?.value
      const token = cookieStore.get('auth_token')?.value
      console.error('[AI Summarize] Cookie check - userId:', userId ? 'exists' : 'missing', 'token:', token ? 'exists' : 'missing')
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Get token for backend API calls
    let token = await getAuthToken(req)
    if (!token) {
      // Fallback: get from cookies directly
      const cookieStore = await cookies()
      token = cookieStore.get('auth_token')?.value || null
      if (!token) {
        console.error('[AI Summarize] No token found in headers or cookies')
        return NextResponse.json(
          { error: 'Unauthorized - No authentication token' },
          { status: 401 }
        )
      }
    }
    
    console.log('[AI Summarize] Using token for API calls:', token ? 'token exists' : 'no token')

    // Fetch recent trades for analysis from backend API with timeout
    const tradesController = new AbortController()
    const tradesTimeout = setTimeout(() => tradesController.abort(), 10000) // 10 second timeout
    
    let allTrades: any[] = []
    try {
      const tradesResponse = await fetch(`${backendBaseUrl}/trades?userId=${String(user.id)}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: tradesController.signal
      })
      clearTimeout(tradesTimeout)
      
      if (!tradesResponse.ok) {
        throw new Error('Failed to fetch trades')
      }
      const tradesResponseData = await tradesResponse.json()
      allTrades = tradesResponseData.trades || []
    } catch (error: any) {
      clearTimeout(tradesTimeout)
      if (error.name === 'AbortError') {
        console.error('[AI Summarize] Trades fetch timeout')
      } else {
        console.error('[AI Summarize] Error fetching trades:', error)
      }
      // Continue with empty trades array rather than failing completely
    }
    
    // Get recent 30 trades (reduced from 50 for faster processing), sorted by entryDate
    const recentTrades = allTrades
      .sort((a: any, b: any) => {
        const dateA = new Date(a.entryDate || a.createdAt || 0).getTime()
        const dateB = new Date(b.entryDate || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 30) // Reduced from 50 to 30 for faster processing
      .map((trade: any) => ({
        s: trade.symbol || trade.instrument, // Shortened keys
        d: trade.direction || trade.side,
        p: trade.pnl || 0,
        pp: trade.pnlPercent || 0,
        ed: trade.entryDate || trade.createdAt,
        ep: trade.entryPrice || 0,
        cp: trade.exitPrice || trade.closePrice || 0,
        q: trade.quantity || 0,
        st: trade.strategy || null,
      }))

    // Fetch strategies for strategy analysis from backend API with timeout
    const strategiesController = new AbortController()
    const strategiesTimeout = setTimeout(() => strategiesController.abort(), 10000) // 10 second timeout
    
    let strategies: any[] = []
    try {
      const strategiesResponse = await fetch(`${backendBaseUrl}/strategies?userId=${String(user.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: strategiesController.signal
      })
      clearTimeout(strategiesTimeout)
      
      if (!strategiesResponse.ok) {
        throw new Error('Failed to fetch strategies')
      }
      const strategiesResponseData = await strategiesResponse.json()
      strategies = (strategiesResponseData.strategies || []).slice(0, 10).map((strategy: any) => ({ // Limit to 10 strategies
        id: strategy.id,
        n: strategy.name, // Shortened keys
        d: strategy.description,
        c: strategy.category,
        a: strategy.isActive ?? true,
      }))
    } catch (error: any) {
      clearTimeout(strategiesTimeout)
      if (error.name === 'AbortError') {
        console.error('[AI Summarize] Strategies fetch timeout')
      } else {
        console.error('[AI Summarize] Error fetching strategies:', error)
      }
      // Continue with empty strategies array
    }

    // Get the model with optimized settings
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 2048, // Limit response length for faster generation
        temperature: 0.7,
      }
    })

    // Create prompts based on summary type - use compact JSON
    const tradesData = JSON.stringify(recentTrades) // Compact format (no pretty print)
    const strategiesData = JSON.stringify(strategies) // Compact format

      const prompts: Record<string, string> = {
        daily: `Analyze these trades and provide a concise daily summary. Data: ${tradesData}

Provide: Performance overview (win rate, P&L), key patterns, improvement recommendations, and risk assessment. Use markdown with headings (##), bullets, and bold text. Keep it focused and actionable.`,

        strategy: `Analyze strategies and trades. Strategies: ${strategiesData}. Trades: ${tradesData}

Provide: Performance metrics per strategy, comparison, strengths/weaknesses, optimization recommendations, and risk assessment. Use markdown with headings (##), bullets, bold text, and tables. Keep it focused.`,

        market: `Analyze market conditions from trading data: ${tradesData}

Provide: Market conditions inference, asset performance trends, technical insights, market sentiment, trading opportunities, and outlook. Use markdown with headings (##), bullets, bold text, and tables. Keep it concise.`,

        risk: `Analyze risk from trading data. Trades: ${tradesData}. Strategies: ${strategiesData}

Provide: Risk metrics (drawdown, Sharpe, volatility), risk factors, position sizing recommendations, diversification assessment, risk mitigation actions, and stop-loss/take-profit advice. Use markdown with headings (##), bullets, bold text, and tables. Keep it focused.`
    }

    const prompt = prompts[type] || prompts.daily

    // Generate content - timeout is handled by maxDuration
    const startTime = Date.now()
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      const elapsed = Date.now() - startTime
      console.log(`[AI Summarize] Generation completed in ${elapsed}ms`)

      return NextResponse.json({ summary: text })
    } catch (error: any) {
      const elapsed = Date.now() - startTime
      console.error(`[AI Summarize] Generation error after ${elapsed}ms:`, error)
      if (error.message?.includes('timeout') || elapsed > 50000) {
        return NextResponse.json(
          { error: 'Generation took too long. Please try again with fewer trades.' },
          { status: 408 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
