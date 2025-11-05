import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { cookies } from 'next/headers'

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const backendBaseUrl = 'https://trade-backend-production-b0a3.up.railway.app'

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

    // Fetch recent trades for analysis from backend API
    const tradesResponse = await fetch(`${backendBaseUrl}/trades?userId=${String(user.id)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!tradesResponse.ok) {
      throw new Error('Failed to fetch trades')
    }
    const tradesResponseData = await tradesResponse.json()
    const allTrades = tradesResponseData.trades || []
    
    // Get recent 50 trades, sorted by entryDate
    const recentTrades = allTrades
      .sort((a: any, b: any) => {
        const dateA = new Date(a.entryDate || a.createdAt || 0).getTime()
        const dateB = new Date(b.entryDate || b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 50)
      .map((trade: any) => ({
        symbol: trade.symbol || trade.instrument,
        direction: trade.direction || trade.side,
        pnl: trade.pnl || 0,
        pnlPercent: trade.pnlPercent || 0,
        entryDate: trade.entryDate || trade.createdAt,
        entryPrice: trade.entryPrice || 0,
        closePrice: trade.exitPrice || trade.closePrice || 0,
        quantity: trade.quantity || 0,
        strategy: trade.strategy || null,
      }))

    // Fetch strategies for strategy analysis from backend API
    const strategiesResponse = await fetch(`${backendBaseUrl}/strategies?userId=${String(user.id)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!strategiesResponse.ok) {
      throw new Error('Failed to fetch strategies')
    }
    const strategiesResponseData = await strategiesResponse.json()
    const strategies = (strategiesResponseData.strategies || []).map((strategy: any) => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      category: strategy.category,
      historicalData: strategy.historicalData,
      isActive: strategy.isActive ?? true,
      createdAt: strategy.createdAt
    }))

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create prompts based on summary type
    const tradesData = JSON.stringify(recentTrades, null, 2)
    const strategiesData = JSON.stringify(strategies, null, 2)

      const prompts: Record<string, string> = {
        daily: `You are an expert trading analyst. Based on the following recent trading data, provide a comprehensive daily trading summary:
      
      Recent Trades (last 50):
      ${tradesData}
      
      Generate a detailed analysis including:
      - Performance overview (win rate, total P&L, best/worst trades)
      - Key patterns and insights from recent trading activity
      - Specific recommendations for improvement
      - Risk assessment and position sizing analysis
      
      Format your response as clean, well-structured markdown with:
      - Clear headings using ## and ###
      - Bullet points using - or *
      - Bold text for important metrics using **text**
      - Tables for data comparison when relevant
      - Horizontal rules (---) to separate sections
      - Professional formatting that's easy to read
      
      Be specific about the data and provide actionable insights.`,

        strategy: `You are an expert trading analyst. Analyze the following trading strategies:
      
      Strategies Data:
      ${strategiesData}
      
      Recent Trades Data:
      ${tradesData}
      
      Provide a comprehensive strategy review including:
      - Overall performance metrics for each strategy (win rate, profit factor, P&L)
      - Comparison between different strategies
      - Strengths and weaknesses analysis
      - Market condition impact on strategy performance
      - Specific optimization recommendations
      - Risk management assessment
      
      Format your response as clean, well-structured markdown with:
      - Clear headings using ## and ###
      - Bullet points using - or *
      - Bold text for important metrics using **text**
      - Tables for strategy comparison when relevant
      - Horizontal rules (---) to separate sections
      - Professional formatting that's easy to read
      
      Be specific about the data and provide actionable recommendations.`,

        market: `You are a market analyst. Based on the trading data and market conditions:
      
      Recent Trades:
      ${tradesData}
      
      Generate a comprehensive market analysis including:
      - Market conditions inference from your trading patterns
      - Asset/symbol performance trends from your trades
      - Technical analysis insights from your trade data
      - Market sentiment based on your trading activity
      - Trading opportunities and market outlook
      - Recommendations based on current market patterns
      
      Format your response as clean, well-structured markdown with:
      - Clear headings using ## and ###
      - Bullet points using - or *
      - Bold text for important metrics using **text**
      - Tables for market data when relevant
      - Horizontal rules (---) to separate sections
      - Professional formatting that's easy to read
      
      Be specific about the data and provide actionable insights.`,

        risk: `You are a risk management expert. Analyze the following trading data for risk assessment:
      
      Recent Trades:
      ${tradesData}
      
      Strategies:
      ${strategiesData}
      
      Provide a detailed risk analysis including:
      - Current risk level and metrics (drawdown, Sharpe ratio, volatility)
      - Risk factors identified from your trading patterns
      - Position sizing analysis and recommendations
      - Diversification assessment (by strategy, symbol, timeframe)
      - Specific risk mitigation recommendations
      - Action items to improve risk management
      - Stop-loss and take-profit recommendations
      
      Format your response as clean, well-structured markdown with:
      - Clear headings using ## and ###
      - Bullet points using - or *
      - Bold text for important metrics using **text**
      - Tables for risk metrics when relevant
      - Horizontal rules (---) to separate sections
      - Professional formatting that's easy to read
      
      Be specific about the data and provide actionable recommendations.`
    }

    const prompt = prompts[type] || prompts.daily

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
