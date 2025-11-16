import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
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
      strategies = (strategiesResponseData.strategies || []).slice(0, 10).map((strategy: any) => {
        // Calculate strategy performance from historical data
        let totalPnL = 0
        let totalTrades = 0
        let winRate = 0
        let profitFactor = 0
        
        if (strategy.historicalData) {
          let historicalData = strategy.historicalData
          if (typeof historicalData === 'string') {
            try {
              historicalData = JSON.parse(historicalData)
            } catch {
              historicalData = null
            }
          }
          
          if (historicalData && historicalData.entries && Array.isArray(historicalData.entries)) {
            const entries = historicalData.entries
            totalTrades = entries.length
            
            const parseNum = (v: any) => {
              if (typeof v === 'number' && Number.isFinite(v)) return v
              const n = Number(String(v).replace(/[^0-9.+-]/g, ''))
              return Number.isFinite(n) ? n : 0
            }
            
            const liveValues: number[] = entries.map((e: any) => parseNum(e.live))
            totalPnL = liveValues.reduce((sum, v) => sum + v, 0)
            
            const winningEntries = liveValues.filter((pnl: number) => pnl > 0).length
            winRate = totalTrades > 0 ? (winningEntries / totalTrades) * 100 : 0
            
            const totalProfit = liveValues.filter((pnl: number) => pnl > 0).reduce((sum: number, pnl: number) => sum + pnl, 0)
            const totalLoss = Math.abs(liveValues.filter((pnl: number) => pnl < 0).reduce((sum: number, pnl: number) => sum + pnl, 0))
            profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0)
          }
        }
        
        return {
          id: strategy.id,
          n: strategy.name, // Shortened keys
          d: strategy.description,
          c: strategy.category,
          a: strategy.isActive ?? true,
          pnl: totalPnL, // Total P&L from historical data
          tr: totalTrades, // Total trades
          wr: winRate, // Win rate
          pf: profitFactor, // Profit factor
        }
      })
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

IMPORTANT: Always use Indian Rupees (₹) for all currency amounts. Never use dollars ($) or USD. Format amounts as ₹1,234.56 or ₹1,234.

Provide: Performance overview (win rate, P&L in ₹), key patterns, improvement recommendations, and risk assessment. Use markdown with headings (##), bullets, and bold text. Keep it focused and actionable.`,

        strategy: `Analyze and compare trading strategies with their performance data. Focus primarily on STRATEGIES analysis.

IMPORTANT: Always use Indian Rupees (₹) for all currency amounts. Never use dollars ($) or USD. Format amounts as ₹1,234.56 or ₹1,234.

Strategies Data (with performance metrics): ${strategiesData}
Trades Data (for context): ${tradesData}

For EACH strategy, analyze:
1. Performance metrics (P&L in ₹, win rate, profit factor, total trades)
2. Strategy effectiveness and consistency
3. Strengths and weaknesses
4. Comparison between different strategies
5. Optimization recommendations specific to each strategy
6. Risk assessment per strategy

Provide: Detailed strategy-by-strategy analysis, performance comparison table, strategy ranking, optimization recommendations, and actionable insights. Use markdown with headings (##), bullets, bold text, and tables. Focus on STRATEGY analysis, not just trades.`,

        market: `Analyze trading performance and patterns from trade data: ${tradesData}

IMPORTANT: Always use Indian Rupees (₹) for all currency amounts. Never use dollars ($) or USD. Format amounts as ₹1,234.56 or ₹1,234.

Provide: Trade performance analysis, asset performance trends, technical insights, trading patterns, opportunities, and recommendations. Use markdown with headings (##), bullets, bold text, and tables. Keep it concise.`,

        risk: `Analyze risk from trading data. Trades: ${tradesData}. Strategies: ${strategiesData}

IMPORTANT: Always use Indian Rupees (₹) for all currency amounts. Never use dollars ($) or USD. Format amounts as ₹1,234.56 or ₹1,234.

Provide: Risk metrics (drawdown, Sharpe, volatility), risk factors, position sizing recommendations in ₹, diversification assessment, risk mitigation actions, and stop-loss/take-profit advice. Use markdown with headings (##), bullets, bold text, and tables. Keep it focused.`
    }

    const prompt = prompts[type] || prompts.daily

    // Generate content - timeout is handled by maxDuration
    const startTime = Date.now()
    
    // Try Gemini first
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      const elapsed = Date.now() - startTime
      console.log(`[AI Summarize] Gemini generation completed in ${elapsed}ms`)

      return NextResponse.json({ summary: text })
    } catch (geminiError: any) {
      const elapsed = Date.now() - startTime
      console.error(`[AI Summarize] Gemini generation error after ${elapsed}ms:`, geminiError)
      
      // Check if it's a timeout error
      if (geminiError.message?.includes('timeout') || elapsed > 50000) {
        return NextResponse.json(
          { error: 'Generation took too long. Please try again with fewer trades.' },
          { status: 408 }
        )
      }

      // Fallback to OpenAI if Gemini fails
      console.log('[AI Summarize] Falling back to OpenAI...')
      
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        console.error('[AI Summarize] OpenAI API key not configured for fallback')
        throw geminiError // Re-throw original error if no OpenAI fallback available
      }

      try {
        const openaiStartTime = Date.now()
        const { text } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt: prompt,
          temperature: 0.7,
        })
        const openaiElapsed = Date.now() - openaiStartTime
        console.log(`[AI Summarize] OpenAI fallback generation completed in ${openaiElapsed}ms`)

        return NextResponse.json({ 
          summary: text,
          provider: 'openai-fallback' // Indicate that OpenAI was used as fallback
        })
      } catch (openaiError: any) {
        console.error('[AI Summarize] OpenAI fallback also failed:', openaiError)
        // If both fail, throw the original Gemini error
        throw geminiError
      }
    }
  } catch (error) {
    console.error('[AI Summarize] Final error after all attempts:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again later.' },
      { status: 500 }
    )
  }
}
