'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  Trophy, 
  Scale, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Settings,
  Brain,
  ArrowUp
} from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts'
import { useState, useEffect } from 'react'
import { useTradesStore } from '@/store/trades-store'

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
}

interface KPIData {
  highestPnL: { value: number; change: number; currency: string }
  winRate: { value: number; change: number; unit: string }
  riskReward: { value: string; change: number; unit: string }
  tradesThisMonth: { value: number; change: number; unit: string }
}

function calculateKPIs(trades: Trade[]): KPIData {
  if (trades.length === 0) {
    return {
      highestPnL: { value: 0, change: 0, currency: '$' },
      winRate: { value: 0, change: 0, unit: '%' },
      riskReward: { value: '1:0', change: 0, unit: '' },
      tradesThisMonth: { value: 0, change: 0, unit: '' }
    }
  }

  // Calculate highest P&L
  const highestPnL = Math.max(...trades.map(t => t.pnl))
  
  // Calculate win rate
  const winningTrades = trades.filter(t => t.pnl > 0).length
  const winRate = (winningTrades / trades.length) * 100
  
  // Calculate average risk/reward (simplified)
  const avgPnL = trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length
  const avgLoss = trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + Math.abs(t.pnl), 0) / Math.max(trades.filter(t => t.pnl < 0).length, 1)
  const riskReward = avgLoss > 0 ? (avgPnL / avgLoss).toFixed(1) : '1:0'
  
  // Calculate trades this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const tradesThisMonth = trades.filter(t => {
    const tradeDate = new Date(t.entryDate)
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear
  }).length

  // Calculate changes (simplified - would need historical data for accurate calculation)
  const change = 0 // Placeholder - would need historical comparison

  return {
    highestPnL: { value: highestPnL, change, currency: '$' },
    winRate: { value: winRate, change, unit: '%' },
    riskReward: { value: `1:${riskReward}`, change, unit: '' },
    tradesThisMonth: { value: tradesThisMonth, change, unit: '' }
  }
}

function calculateCumulativePnL(trades: Trade[]) {
  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
  
  let cumulative = 0
  return sortedTrades.map(trade => {
    cumulative += trade.pnl
    return {
      date: trade.entryDate,
      value: cumulative
    }
  })
}

function getTopTrades(trades: Trade[], limit: number = 5) {
  return [...trades]
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, limit)
    .map(trade => ({
      symbol: trade.instrument,
      type: trade.side === 'BUY' ? 'Long' : 'Short',
      date: new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      entry: parseFloat(trade.entryPrice),
      exit: parseFloat(trade.closePrice),
      pnl: trade.pnl,
      percentage: ((trade.pnl / (parseFloat(trade.entryPrice) * trade.quantity)) * 100).toFixed(2),
      icon: <Brain className="w-4 h-4" />
    }))
}

function KPICard({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue",
  currency = "",
  unit = ""
}: {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color?: "green" | "blue" | "orange" | "red"
  currency?: string
  unit?: string
}) {
  const colorClasses = {
    green: "text-green-500",
    blue: "text-blue-500", 
    orange: "text-orange-500",
    red: "text-red-500"
  }

  const barColors = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500", 
    red: "bg-red-500"
  }

  return (
    <Card className="p-6 space-y-2 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        <Badge variant="secondary" className="bg-gray-700 text-gray-300">Active</Badge>
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>
        {currency}{typeof value === 'number' ? value.toLocaleString() : value}{unit}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>vs last 3 months</span>
        <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
          {change >= 0 ? "+" : ""}{change}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div className={`h-1 rounded-full ${barColors[color]} w-3/4`}></div>
      </div>
      <div className="flex justify-end">
        <div className={`p-2 rounded-lg bg-gray-700 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

function ConfidenceIndex({ trades }: { trades: Trade[] }) {
  // Calculate confidence based on recent performance
  const recentTrades = trades.slice(-10) // Last 10 trades
  const recentWinRate = recentTrades.length > 0 ? 
    (recentTrades.filter(t => t.pnl > 0).length / recentTrades.length) * 100 : 0
  
  const confidence = Math.min(95, Math.max(5, recentWinRate))
  
  const getConfidenceText = (level: number) => {
    if (level >= 80) return "High Confidence - You are trading well with consistent focus."
    if (level >= 60) return "Good Confidence - You're on the right track."
    if (level >= 40) return "Moderate Confidence - Room for improvement."
    return "Low Confidence - Consider reviewing your strategy."
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Confidence Index</h3>
        <span className="text-sm text-gray-400">Last 90 Days</span>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <div className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
            <div 
              className="absolute top-0 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-y-1.5 transition-all duration-300"
              style={{ left: `${confidence}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
        
        <p className="text-white text-sm">{getConfidenceText(confidence)}</p>
      </div>
    </Card>
  )
}

function CumulativePnLChart({ trades }: { trades: Trade[] }) {
  const [timeframe, setTimeframe] = useState('W')
  const cumulativeData = calculateCumulativePnL(trades)
  
  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Cumulative P&L</h3>
        <div className="flex space-x-2">
          {['D', 'W', 'M'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
              className={timeframe === period ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 border-gray-600"}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'P&L']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

function TopTradesCard({ trades }: { trades: Trade[] }) {
  const topTrades = getTopTrades(trades, 5)
  
  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Top Trades</h3>
        <Button variant="link" className="text-blue-500 hover:text-blue-400 p-0 h-auto">
          View All
        </Button>
      </div>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {topTrades.map((trade, index) => (
          <div key={index} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{trade.symbol}</h4>
                  <div className="text-gray-400">{trade.icon}</div>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {trade.type} • {trade.date}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Entry: </span>
                    <span className="text-white">${trade.entry}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Exit: </span>
                    <span className="text-white">${trade.exit}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-green-500 font-medium">
                    +${trade.pnl.toLocaleString()} ({trade.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
        <Button variant="link" className="text-gray-400 hover:text-gray-300 p-0 h-auto text-sm">
          Settings
        </Button>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 p-0"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}

export function TradeDiaryDashboardIntegrated() {
  const { trades } = useTradesStore()
  const [kpis, setKpis] = useState<KPIData | null>(null)

  useEffect(() => {
    if (trades && trades.length > 0) {
      setKpis(calculateKPIs(trades as Trade[]))
    }
  }, [trades])

  if (!kpis) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading trading data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Highest P&L"
            value={kpis.highestPnL.value}
            change={kpis.highestPnL.change}
            currency={kpis.highestPnL.currency}
            icon={<Wallet className="w-5 h-5" />}
            color="green"
          />
          <KPICard
            title="Win Rate"
            value={kpis.winRate.value}
            change={kpis.winRate.change}
            unit={kpis.winRate.unit}
            icon={<Trophy className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            title="Avg. Risk/Reward"
            value={kpis.riskReward.value}
            change={kpis.riskReward.change}
            icon={<Scale className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            title="Trades This Month"
            value={kpis.tradesThisMonth.value}
            change={kpis.tradesThisMonth.change}
            icon={<BarChart3 className="w-5 h-5" />}
            color="orange"
          />
        </div>

        {/* Confidence Index */}
        <ConfidenceIndex trades={trades as Trade[]} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CumulativePnLChart trades={trades as Trade[]} />
          <TopTradesCard trades={trades as Trade[]} />
        </div>
      </div>
    </div>
  )
}

