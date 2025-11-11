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

    // For daily summary, only get today's trades
    const isDailySummary = type === 'daily'
    let dateFilter: string | undefined = undefined
    
    if (isDailySummary) {
      // Get today's date at midnight (start of day) in ISO format
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = today.toISOString()
      console.log('[AI Summarize] Daily summary - filtering trades from:', dateFilter)
    }

    // Fetch trades for analysis from backend API with timeout
    const tradesController = new AbortController()
    const tradesTimeout = setTimeout(() => tradesController.abort(), 10000) // 10 second timeout
    
    let allTrades: any[] = []
    try {
      // Build query URL with date filter for daily summaries
      let tradesUrl = `${backendBaseUrl}/trades?userId=${String(user.id)}`
      if (dateFilter) {
        tradesUrl += `&from=${encodeURIComponent(dateFilter)}`
      }
      
      const tradesResponse = await fetch(tradesUrl, {
        headers: { Authorization: `Bearer ${token}` },
        signal: tradesController.signal
      })
      clearTimeout(tradesTimeout)
      
      if (!tradesResponse.ok) {
        let errorText = 'Unknown error'
        try {
          errorText = await tradesResponse.text()
        } catch {
          // Response body already consumed or not available
        }
        console.error(`[AI Summarize] Trades fetch failed: ${tradesResponse.status} ${tradesResponse.statusText}`, errorText)
        throw new Error(`Failed to fetch trades: ${tradesResponse.status} ${tradesResponse.statusText}`)
      }
      
      let tradesResponseData: any
      try {
        tradesResponseData = await tradesResponse.json()
      } catch (error: any) {
        console.error('[AI Summarize] Error parsing trades response:', error)
        throw new Error('Invalid response from trades API')
      }
      allTrades = tradesResponseData.trades || []
      console.log(`[AI Summarize] Fetched ${allTrades.length} trades${isDailySummary ? ' (today only)' : ''}`)
    } catch (error: any) {
      clearTimeout(tradesTimeout)
      if (error.name === 'AbortError') {
        console.error('[AI Summarize] Trades fetch timeout')
      } else {
        console.error('[AI Summarize] Error fetching trades:', error)
      }
      // For non-daily summaries, we can continue with empty trades (they might have strategies)
      // For daily summaries, we need trades, so return error
      if (isDailySummary) {
        return NextResponse.json(
          { error: 'Failed to fetch today\'s trades. Please try again later.' },
          { status: 500 }
        )
      }
      // Continue with empty trades array for other types
      allTrades = []
    }
    
    // Filter and process trades
    // For daily summary, filter by entryDate to ensure only today's trades
    // For other types, get recent trades
    let filteredTrades = allTrades
    
    if (isDailySummary) {
      // Filter to only today's trades based on entryDate
      const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      filteredTrades = allTrades.filter((trade: any) => {
        const tradeDate = trade.entryDate || trade.createdAt
        if (!tradeDate) return false
        // Handle both ISO string and date object
        const tradeDateStr = typeof tradeDate === 'string' 
          ? tradeDate.split('T')[0] 
          : new Date(tradeDate).toISOString().split('T')[0]
        return tradeDateStr === todayStr
      })
      console.log(`[AI Summarize] Filtered to ${filteredTrades.length} trades from today`)
    }
    
    // Sort by entryDate (most recent first) and limit to prevent token overflow
    // For daily: use all today's trades (but cap at 100 to avoid token limits)
    // For others: use recent 50 trades (increased for better analysis)
    const maxTrades = isDailySummary ? 100 : 50
    const recentTrades = filteredTrades
      .sort((a: any, b: any) => {
        const dateA = new Date(a.entryDate || a.createdAt || 0).getTime()
        const dateB = new Date(b.entryDate || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, maxTrades)
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
    
    console.log(`[AI Summarize] Processing ${recentTrades.length} trades for ${type} summary`)

    // Fetch strategies for strategy analysis from backend API with timeout
    const strategiesController = new AbortController()
    const strategiesTimeout = setTimeout(() => strategiesController.abort(), 10000) // 10 second timeout
    
    let allStrategies: any[] = []
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
      allStrategies = strategiesResponseData.strategies || []
    } catch (error: any) {
      clearTimeout(strategiesTimeout)
      if (error.name === 'AbortError') {
        console.error('[AI Summarize] Strategies fetch timeout')
      } else {
        console.error('[AI Summarize] Error fetching strategies:', error)
      }
      // Continue with empty strategies array
    }

    // For daily summary, filter strategies to only those used in today's trades
    // and calculate performance metrics from today's trades only
    let strategies: any[] = []
    
    if (isDailySummary) {
      // Get unique strategy names/IDs from today's trades
      const todayStrategyNames = new Set<string>()
      recentTrades.forEach((trade: any) => {
        if (trade.st && trade.st.trim()) {
          todayStrategyNames.add(trade.st.trim())
        }
      })
      
      console.log(`[AI Summarize] Found ${todayStrategyNames.size} unique strategies used today:`, Array.from(todayStrategyNames))
      
      // Filter strategies to only those used today
      const todayStrategies = allStrategies.filter((strategy: any) => {
        // Match by strategy name or ID
        return todayStrategyNames.has(strategy.name?.trim()) || 
               todayStrategyNames.has(strategy.id?.trim()) ||
               (strategy.name && todayStrategyNames.has(String(strategy.name).trim()))
      })
      
      // Calculate performance metrics from today's trades only
      strategies = todayStrategies.map((strategy: any) => {
        // Get trades for this strategy from today
        const strategyTrades = recentTrades.filter((trade: any) => {
          const tradeStrategy = trade.st?.trim()
          return tradeStrategy === strategy.name?.trim() || 
                 tradeStrategy === strategy.id?.trim() ||
                 (strategy.name && tradeStrategy === String(strategy.name).trim())
        })
        
        // Calculate metrics from today's trades only
        const totalTrades = strategyTrades.length
        const totalPnL = strategyTrades.reduce((sum: number, trade: any) => sum + (trade.p || 0), 0)
        const winningTrades = strategyTrades.filter((trade: any) => (trade.p || 0) > 0).length
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
        
        const profits = strategyTrades.filter((trade: any) => (trade.p || 0) > 0).map((trade: any) => trade.p || 0)
        const losses = strategyTrades.filter((trade: any) => (trade.p || 0) < 0).map((trade: any) => Math.abs(trade.p || 0))
        const totalProfit = profits.reduce((sum: number, p: number) => sum + p, 0)
        const totalLoss = losses.reduce((sum: number, l: number) => sum + l, 0)
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0)
        
        return {
          id: strategy.id,
          n: strategy.name, // Shortened keys
          d: strategy.description,
          c: strategy.category,
          a: strategy.isActive ?? true,
          pnl: totalPnL, // P&L from today's trades only
          tr: totalTrades, // Trades from today only
          wr: winRate, // Win rate from today's trades
          pf: profitFactor, // Profit factor from today's trades
        }
      })
      
      console.log(`[AI Summarize] Filtered to ${strategies.length} strategies used today with today's performance metrics`)
    } else {
      // For non-daily summaries, use all strategies with historical data
      strategies = allStrategies.slice(0, 10).map((strategy: any) => {
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
    }

    // Get the model with optimized settings
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 8192, // Increased for comprehensive full responses
        temperature: 0.7,
      }
    })

    // Check if we have trades to analyze
    // Strategy analysis can work with just strategies, but others need trades
    if (recentTrades.length === 0 && type !== 'strategy') {
      console.warn(`[AI Summarize] No trades found for ${type} summary`)
      return NextResponse.json(
        { error: `No trades found${isDailySummary ? ' for today' : ''}. Please add some trades first.` },
        { status: 400 }
      )
    }
    
    // Strategy analysis needs at least strategies
    if (type === 'strategy' && strategies.length === 0 && recentTrades.length === 0) {
      console.warn('[AI Summarize] No strategies or trades found for strategy analysis')
      return NextResponse.json(
        { error: 'No strategies or trades found. Please add some strategies or trades first.' },
        { status: 400 }
      )
    }

    // Check if we have too many trades that might exceed token limits
    // Estimate: each trade ~100-150 tokens, prompt base ~200 tokens, max input ~8000 tokens
    // So we should limit to ~50 trades max
    if (recentTrades.length > 50) {
      console.warn(`[AI Summarize] Too many trades (${recentTrades.length}), limiting to 50 to avoid token limits`)
      recentTrades.splice(50)
    }

    // Create prompts based on summary type - use compact JSON
    let tradesData: string
    let strategiesData: string
    
    try {
      tradesData = JSON.stringify(recentTrades) // Compact format (no pretty print)
      strategiesData = JSON.stringify(strategies) // Compact format
    } catch (error: any) {
      console.error('[AI Summarize] Error stringifying data:', error)
      return NextResponse.json(
        { error: 'Failed to process trade data. Please try again.' },
        { status: 500 }
      )
    }

    // Check data size to prevent token limit issues
    const estimatedTokens = Math.ceil((tradesData.length + strategiesData.length) / 4) // Rough estimate: ~4 chars per token
    console.log(`[AI Summarize] Estimated input tokens: ${estimatedTokens}`)
    
    if (estimatedTokens > 25000) {
      console.warn(`[AI Summarize] Large input detected (${estimatedTokens} tokens), may hit token limits`)
    }

    const prompts: Record<string, string> = {
        daily: `Analyze these trades from today and provide a concise daily summary. 

Trades Data (from today only): ${tradesData}
${strategies.length > 0 ? `Strategies Data (used today only, with today's performance metrics): ${strategiesData}` : ''}

Provide: Performance overview (win rate, P&L), key patterns${strategies.length > 0 ? ', strategy performance analysis for strategies used today' : ''}, improvement recommendations, and risk assessment. Use markdown with headings (##), bullets, and bold text. Keep it focused and actionable.`,

        strategy: `Analyze and compare trading strategies with their performance data. Focus primarily on STRATEGIES analysis.

Strategies Data (with performance metrics): ${strategiesData}
Trades Data (for context): ${tradesData}

For EACH strategy, analyze:
1. Performance metrics (P&L, win rate, profit factor, total trades)
2. Strategy effectiveness and consistency
3. Strengths and weaknesses
4. Comparison between different strategies
5. Optimization recommendations specific to each strategy
6. Risk assessment per strategy

Provide: Detailed strategy-by-strategy analysis, performance comparison table, strategy ranking, optimization recommendations, and actionable insights. Use markdown with headings (##), bullets, bold text, and tables. Focus on STRATEGY analysis, not just trades.`,

        market: `Analyze market conditions from trading data: ${tradesData}

Provide: Market conditions inference, asset performance trends, technical insights, market sentiment, trading opportunities, and outlook. Use markdown with headings (##), bullets, bold text, and tables. Keep it concise.`,

        risk: `Analyze risk from trading data. Trades: ${tradesData}. Strategies: ${strategiesData}

Provide: Risk metrics (drawdown, Sharpe, volatility), risk factors, position sizing recommendations, diversification assessment, risk mitigation actions, and stop-loss/take-profit advice. Use markdown with headings (##), bullets, bold text, and tables. Keep it focused.`
    }

    const prompt = prompts[type] || prompts.daily

    // Validate prompt exists and is not empty
    if (!prompt || prompt.trim().length === 0) {
      console.error(`[AI Summarize] Invalid prompt for type: ${type}`)
      return NextResponse.json(
        { error: `Invalid summary type: ${type}` },
        { status: 400 }
      )
    }

    // Generate content - timeout is handled by maxDuration
    const startTime = Date.now()
    try {
      console.log(`[AI Summarize] Generating ${type} summary with ${recentTrades.length} trades`)
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      const elapsed = Date.now() - startTime
      console.log(`[AI Summarize] Generation completed in ${elapsed}ms`)

      if (!text || text.trim().length === 0) {
        console.error('[AI Summarize] Empty response from AI')
        return NextResponse.json(
          { error: 'AI returned an empty response. Please try again.' },
          { status: 500 }
        )
      }

      return NextResponse.json({ summary: text })
    } catch (error: any) {
      const elapsed = Date.now() - startTime
      console.error(`[AI Summarize] Generation error after ${elapsed}ms:`, error)
      
      // Handle token limit errors
      if (error.message?.includes('token') || error.message?.includes('Token') || 
          error.message?.includes('input') || error.message?.includes('limit')) {
        return NextResponse.json(
          { error: 'Too much data to process. Please try again with fewer trades or contact support.' },
          { status: 413 }
        )
      }
      
      // Handle timeout errors
      if (error.message?.includes('timeout') || elapsed > 50000) {
        return NextResponse.json(
          { error: 'Generation took too long. Please try again with fewer trades.' },
          { status: 408 }
        )
      }
      
      throw error
    }
  } catch (error: any) {
    console.error('[AI Summarize] Top-level error:', error)
    console.error('[AI Summarize] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      type: typeof error
    })
    
    // Return more specific error messages
    if (error?.message) {
      return NextResponse.json(
        { error: `Failed to generate summary: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again later.' },
      { status: 500 }
    )
  }
}
