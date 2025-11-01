'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import { useState, useEffect } from 'react'
import { useTradesStore } from '@/store/trades-store'
import { MarketSentiment } from './market-sentiment'

interface Trade {
  id: string
  instrument: string
  entryPrice: string
  closePrice: string
  entryDate: string
  closeDate: string
  pnl: number
  side: string
  quantity: number
  commission: number
  comment?: string
  tags?: string[]
}

// Advanced Analytics Component
function AdvancedAnalytics({ trades }: { trades: Trade[] }) {
  const [timeframe, setTimeframe] = useState('1M')
  
  // Calculate advanced metrics
  const totalTrades = trades.length
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const losingTrades = trades.filter(t => t.pnl < 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
  
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
  const avgWin = winningTrades > 0 ? trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0
  const avgLoss = losingTrades > 0 ? Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades) : 0
  const profitFactor = avgLoss > 0 ? (avgWin * winningTrades) / (avgLoss * losingTrades) : 0
  
  const maxDrawdown = calculateMaxDrawdown(trades)
  const sharpeRatio = calculateSharpeRatio(trades)
  
  // Risk metrics
  const riskPerTrade = 0.02 // 2% risk per trade (example)
  const maxRisk = Math.max(...trades.map(t => Math.abs(t.pnl) / (parseFloat(t.entryPrice) * t.quantity)))
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Profit Factor</h3>
          <Target className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-3xl font-bold text-blue-500">
          {profitFactor.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {profitFactor > 1 ? 'Profitable' : 'Unprofitable'}
        </div>
      </Card>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Max Drawdown</h3>
          <TrendingDown className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-3xl font-bold text-red-500">
          {maxDrawdown.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Risk Level: {maxDrawdown < 10 ? 'Low' : maxDrawdown < 20 ? 'Medium' : 'High'}
        </div>
      </Card>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Sharpe Ratio</h3>
          <BarChart3 className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-3xl font-bold text-green-500">
          {sharpeRatio.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {sharpeRatio > 1 ? 'Good' : sharpeRatio > 0.5 ? 'Fair' : 'Poor'}
        </div>
      </Card>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Risk per Trade</h3>
          <Shield className="w-5 h-5 text-orange-500" />
        </div>
        <div className="text-3xl font-bold text-orange-500">
          {(maxRisk * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {maxRisk < 0.02 ? 'Conservative' : maxRisk < 0.05 ? 'Moderate' : 'Aggressive'}
        </div>
      </Card>
    </div>
  )
}

// Real-time P&L Component
function RealTimePnL({ trades }: { trades: Trade[] }) {
  const [currentPnL, setCurrentPnL] = useState(0)
  const [dailyPnL, setDailyPnL] = useState(0)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        const total = trades.reduce((sum, t) => sum + t.pnl, 0)
        setCurrentPnL(total)
        
        // Calculate today's P&L
        const today = new Date().toDateString()
        const todayTrades = trades.filter(t => new Date(t.entryDate).toDateString() === today)
        const todayTotal = todayTrades.reduce((sum, t) => sum + t.pnl, 0)
        setDailyPnL(todayTotal)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [trades, isLive])

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Real-time P&L</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-400">{isLive ? 'Live' : 'Paused'}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsLive(!isLive)}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">Total P&L</div>
          <div className={`text-2xl font-bold ${currentPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${currentPnL.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Today's P&L</div>
          <div className={`text-2xl font-bold ${dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${dailyPnL.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Strategy Performance Component
function StrategyPerformance({ trades }: { trades: Trade[] }) {
  // Group trades by strategy (using tags or instrument)
  const strategies = trades.reduce((acc, trade) => {
    const strategy = trade.tags?.[0] || trade.instrument
    if (!acc[strategy]) {
      acc[strategy] = []
    }
    acc[strategy].push(trade)
    return acc
  }, {} as Record<string, Trade[]>)

  const strategyData = Object.entries(strategies).map(([name, strategyTrades]) => {
    const totalPnL = strategyTrades.reduce((sum, t) => sum + t.pnl, 0)
    const winRate = strategyTrades.length > 0 ? 
      (strategyTrades.filter(t => t.pnl > 0).length / strategyTrades.length) * 100 : 0
    
    return {
      name,
      trades: strategyTrades.length,
      pnl: totalPnL,
      winRate
    }
  }).sort((a, b) => b.pnl - a.pnl)

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Strategy Performance</h3>
        <Button size="sm" variant="outline" className="text-gray-300 border-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <div className="space-y-4">
        {strategyData.map((strategy, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-white">{strategy.name}</div>
              <div className="text-sm text-gray-400">{strategy.trades} trades</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${strategy.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${strategy.pnl.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{strategy.winRate.toFixed(1)}% win rate</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Trade Journal Component
function TradeJournal({ trades }: { trades: Trade[] }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [journalEntry, setJournalEntry] = useState('')

  const recentTrades = trades
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
        <div className="space-y-3">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTrade?.id === trade.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedTrade(trade)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{trade.instrument}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(trade.entryDate).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${trade.pnl.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Trade Journal</h3>
        {selectedTrade ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Selected Trade</div>
              <div className="font-medium text-white">
                {selectedTrade.instrument} - {selectedTrade.side}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Journal Entry</label>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="What did you learn from this trade? What went well? What could be improved?"
                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Save Journal Entry
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            Select a trade to add journal entry
          </div>
        )}
      </Card>
    </div>
  )
}

// Helper functions
function calculateMaxDrawdown(trades: Trade[]): number {
  if (trades.length === 0) return 0
  
  const sortedTrades = trades.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
  let peak = 0
  let maxDrawdown = 0
  let runningTotal = 0

  for (const trade of sortedTrades) {
    runningTotal += trade.pnl
    if (runningTotal > peak) {
      peak = runningTotal
    }
    const drawdown = peak > 0 ? ((peak - runningTotal) / peak) * 100 : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}

function calculateSharpeRatio(trades: Trade[]): number {
  if (trades.length < 2) return 0
  
  const returns = trades.map(t => t.pnl)
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  const stdDev = Math.sqrt(variance)
  
  return stdDev > 0 ? mean / stdDev : 0
}

// Main Advanced Features Component
export function AdvancedTradingFeatures() {
  const { trades } = useTradesStore()
  const [activeTab, setActiveTab] = useState('analytics')

  if (!trades || trades.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No trading data available</div>
          <div className="text-gray-400">Import some trades to see advanced analytics</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Advanced Trading Analytics</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="text-gray-300 border-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">Analytics</TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-gray-700">Real-time</TabsTrigger>
            <TabsTrigger value="strategies" className="data-[state=active]:bg-gray-700">Strategies</TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-gray-700">Journal</TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-gray-700">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalytics trades={trades as Trade[]} />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimePnL trades={trades as Trade[]} />
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <StrategyPerformance trades={trades as Trade[]} />
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <TradeJournal trades={trades as Trade[]} />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <MarketSentiment />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
