'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, Award, Calendar, BarChart3, Activity, Zap, AlertTriangle } from "lucide-react"
import { AreaChart, Area, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart } from "recharts"
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface StrategyAnalyticsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strategy: any
}

export function StrategyAnalyticsModal({ open, onOpenChange, strategy }: StrategyAnalyticsModalProps) {
  // Early return if no strategy to prevent rendering issues
  if (!strategy) return null

  // Calculate comprehensive metrics from historical data
  const calculateMetrics = () => {
    // Robust numeric parser: strips currency symbols, commas, spaces; supports negatives and decimals
    const parseNumeric = (value: any): number => {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (!value) return 0
      const str = String(value)
        .replace(/[^0-9.+-]/g, '') // keep digits, dot, plus, minus
      const num = Number(str)
      return Number.isFinite(num) ? num : 0
    }
    if (!strategy?.historicalData || !strategy.historicalData.entries) {
      return {
        totalLive: 0,
        totalBacktest: 0,
        avgLive: 0,
        avgBacktest: 0,
        winRateLive: 0,
        winRateBacktest: 0,
        maxProfitLive: 0,
        maxLossLive: 0,
        maxProfitBacktest: 0,
        maxLossBacktest: 0,
        consistency: 0,
        maxDrawdown: 0,
        maxDrawdownBacktest: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        volatility: 0,
        returnMaxDD: 0,
        rewardRiskRatio: 0,
        expectancyRatio: 0,
        maxWinStreak: 0,
        maxLossStreak: 0,
        tradesInDrawdown: 0,
        longestStreak: 0,
        longestStreakStart: '',
        longestStreakEnd: '',
        mostProfitableDay: 0,
        mostProfitableDate: '',
        mostUnprofitableDay: 0,
        mostUnprofitableDate: '',
        totalWinningDays: 0,
        totalLosingDays: 0,
        entries: [],
        monthlyData: {},
        cumulativeData: []
      }
    }

    const entries = strategy.historicalData.entries || []
    const liveValues = entries.map((e: any) => parseNumeric(e.live))
    const backtestValues = entries.map((e: any) => parseNumeric(e.backtest))
    
    const totalLive = liveValues.reduce((sum, val) => sum + val, 0)
    const totalBacktest = backtestValues.reduce((sum, val) => sum + val, 0)
    const avgLive = liveValues.length > 0 ? totalLive / liveValues.length : 0
    const avgBacktest = backtestValues.length > 0 ? totalBacktest / backtestValues.length : 0
    
    const positiveLive = liveValues.filter(v => v > 0).length
    const positiveBacktest = backtestValues.filter(v => v > 0).length
    const winRateLive = entries.length > 0 ? (positiveLive / entries.length) * 100 : 0
    const winRateBacktest = entries.length > 0 ? (positiveBacktest / entries.length) * 100 : 0
    
    const maxProfitLive = Math.max(...liveValues, 0)
    const maxLossLive = Math.min(...liveValues, 0)
    const maxProfitBacktest = Math.max(...backtestValues, 0)
    const maxLossBacktest = Math.min(...backtestValues, 0)
    
    // Calculate max drawdown
    let cumulativeLive = 0
    let peakLive = 0
    let maxDrawdownLive = 0
    let cumulativeBacktest = 0
    let peakBacktest = 0
    let maxDrawdownBacktest = 0
    
    liveValues.forEach((val, idx) => {
      cumulativeLive += val
      if (cumulativeLive > peakLive) peakLive = cumulativeLive
      const drawdown = peakLive - cumulativeLive
      if (drawdown > maxDrawdownLive) maxDrawdownLive = drawdown
    })
    
    backtestValues.forEach((val, idx) => {
      cumulativeBacktest += val
      if (cumulativeBacktest > peakBacktest) peakBacktest = cumulativeBacktest
      const drawdown = peakBacktest - cumulativeBacktest
      if (drawdown > maxDrawdownBacktest) maxDrawdownBacktest = drawdown
    })
    
    // Calculate Sharpe ratio (simplified)
    const variance = liveValues.reduce((sum, val) => sum + Math.pow(val - avgLive, 2), 0) / liveValues.length
    const standardDeviation = Math.sqrt(variance)
    const sharpeRatio = standardDeviation > 0 ? avgLive / standardDeviation : 0
    
    // Calculate profit factor
    const winningTrades = liveValues.filter(v => v > 0)
    const losingTrades = liveValues.filter(v => v < 0)
    const totalWins = winningTrades.reduce((sum, v) => sum + v, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, v) => sum + v, 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0
    
    // Calculate average win and loss
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    
    const largestWin = Math.max(...winningTrades, 0)
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades, 0) : 0
    
    // Calculate volatility
    const volatility = standardDeviation
    
    // Calculate consistency (percentage of days where live and backtest had same sign)
    const sameSignCount = entries.filter((e: any) => {
      const live = parseFloat(e.live) || 0
      const backtest = parseFloat(e.backtest) || 0
      return (live > 0 && backtest > 0) || (live < 0 && backtest < 0) || (live === 0 && backtest === 0)
    }).length
    const consistency = entries.length > 0 ? (sameSignCount / entries.length) * 100 : 0
    
    // Calculate consecutive wins/losses
    let consecutiveWins = 0
    let maxConsecutiveWins = 0
    let consecutiveLosses = 0
    let maxConsecutiveLosses = 0
    
    liveValues.forEach(val => {
      if (val > 0) {
        consecutiveWins++
        maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins)
        consecutiveLosses = 0
      } else if (val < 0) {
        consecutiveLosses++
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses)
        consecutiveWins = 0
      }
    })
    
    // Calculate additional metrics
    const returnMaxDD = maxDrawdownLive > 0 ? totalLive / maxDrawdownLive : 0
    const rewardRiskRatio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0
    const expectancyRatio = (winRateLive / 100) * avgWin + ((100 - winRateLive) / 100) * avgLoss
    const tradesInDrawdown = liveValues.length // Simplified
    
    // Find longest profitable streak
    let longestStreak = 0
    let currentStreak = 0
    let longestStreakStart = ''
    let longestStreakEnd = ''
    let currentStreakStart = ''
    
    entries.forEach((entry, idx) => {
      const pnl = parseFloat(entry.live) || 0
      if (pnl > 0) {
        if (currentStreak === 0) {
          currentStreakStart = entry.date || entry.day || ''
        }
        currentStreak++
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
          longestStreakStart = currentStreakStart
          longestStreakEnd = entry.date || entry.day || ''
        }
      } else {
        currentStreak = 0
      }
    })
    
    // Find most profitable day
    let mostProfitableDay = 0
    let mostProfitableDate = ''
    entries.forEach(entry => {
      const pnl = parseFloat(entry.live) || 0
      if (pnl > mostProfitableDay) {
        mostProfitableDay = pnl
        mostProfitableDate = entry.date || entry.day || ''
      }
    })
    
    // Find most unprofitable day
    let mostUnprofitableDay = 0
    let mostUnprofitableDate = ''
    entries.forEach(entry => {
      const pnl = parseFloat(entry.live) || 0
      if (pnl < mostUnprofitableDay) {
        mostUnprofitableDay = pnl
        mostUnprofitableDate = entry.date || entry.day || ''
      }
    })
    
    // Calculate total winning and losing days
    let totalWinningDays = 0
    let totalLosingDays = 0
    entries.forEach(entry => {
      const pnl = parseFloat(entry.live) || 0
      if (pnl > 0) {
        totalWinningDays++
      } else if (pnl < 0) {
        totalLosingDays++
      }
    })
    
    // Group by month
    const monthlyData: Record<string, any> = {}
    entries.forEach(entry => {
      const date = entry.date || entry.day
      if (date) {
        const monthKey = date.substring(0, 7) // YYYY-MM
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, total: 0, count: 0 }
        }
        monthlyData[monthKey].total += parseNumeric(entry.live)
        monthlyData[monthKey].count++
      }
    })
    
    // Calculate cumulative PnL data (DAY-WISE aggregation)
    // 1) Aggregate all trades by day
    const dailyTotals: Record<string, number> = {}
    entries.forEach((entry: any) => {
      const raw = entry.date || entry.day || ''
      // Normalize to YYYY-MM-DD for grouping
      const dayKey = raw ? String(raw).slice(0, 10) : ''
      if (!dayKey) return
      const amount = parseNumeric(entry.live)
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + amount
    })

    // 2) Build a sorted list of days
    const sortedDays = Object.keys(dailyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // 3) Build cumulative series from the day-wise totals
    const cumulativeData = sortedDays.reduce((acc: any[], day: string, idx: number) => {
      const prev = acc[acc.length - 1] || { cumulative: 0 }
      const daily = dailyTotals[day] || 0
      acc.push({
        date: day,
        cumulative: prev.cumulative + daily,
        daily,
      })
      return acc
    }, [])
    
    return {
      totalLive,
      totalBacktest,
      avgLive,
      avgBacktest,
      winRateLive,
      winRateBacktest,
      maxProfitLive,
      maxLossLive,
      maxProfitBacktest,
      maxLossBacktest,
      consistency,
      maxDrawdown: maxDrawdownLive,
      maxDrawdownBacktest,
      sharpeRatio,
      profitFactor,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      volatility,
      returnMaxDD,
      rewardRiskRatio,
      expectancyRatio,
      maxWinStreak: maxConsecutiveWins,
      maxLossStreak: maxConsecutiveLosses,
      tradesInDrawdown,
      longestStreak,
      longestStreakStart,
      longestStreakEnd,
      mostProfitableDay,
      mostProfitableDate,
      mostUnprofitableDay,
      mostUnprofitableDate,
      totalWinningDays,
      totalLosingDays,
      totalTrades: liveValues.length,
      entries: entries.map((e: any) => ({
        ...e,
        live: parseFloat(e.live) || 0,
        backtest: parseFloat(e.backtest) || 0
      })),
      monthlyData,
      cumulativeData
    }
  }

  const metrics = calculateMetrics()

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Breakout': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Trend': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Mean Reversion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Scalping': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Swing': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'Directional Strategy': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
      case 'Non-Directional Strategy': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'Reversal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-7xl max-h-[95vh] overflow-y-auto bg-background border-border p-2 sm:p-4 lg:p-6">
        <DialogHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="truncate">{strategy.name}</span>
            </DialogTitle>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Badge className={getCategoryColor(strategy.category)}>
              {strategy.category}
            </Badge>
            {strategy.description && (
              <p className="text-sm text-muted-foreground truncate">{strategy.description}</p>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="summary" className="text-xs sm:text-sm py-2">Year Summary</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs sm:text-sm py-2">Performance</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs sm:text-sm py-2">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
            {/* Top Metrics - Total Winning & Total Losing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Winning Days</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{metrics.totalWinningDays || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Losing Days</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">{metrics.totalLosingDays || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Most Profitable & Most Unprofitable Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="border-l-4 border-green-500 pl-4 sm:pl-6">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Most profitable day</p>
                    {metrics.mostProfitableDate && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(metrics.mostProfitableDate), 'MMM d, yyyy')}
                      </p>
                    )}
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      ₹{metrics.mostProfitableDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <div className="border-l-4 border-red-500 pl-4 sm:pl-6">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Most unprofitable day</p>
                    {metrics.mostUnprofitableDate && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(metrics.mostUnprofitableDate), 'MMM d, yyyy')}
                      </p>
                    )}
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">
                      ₹{metrics.mostUnprofitableDay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Performance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Overall Profit</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className={`text-lg sm:text-2xl font-bold ${metrics.totalLive >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{metrics.totalLive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">No. of Trades</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{metrics.totalTrades}</span>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Profit/Trade</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className={`text-lg sm:text-2xl font-bold ${metrics.avgLive >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{metrics.avgLive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Win %</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{metrics.winRateLive.toFixed(2)}</span>
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 sm:space-y-6 mt-4">
            {/* Year Summary Table */}
            <Card className="bg-card border-border">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg">Performance by Year</CardTitle>
                <CardDescription>Monthly breakdown of profit and loss</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 sm:p-3 font-semibold text-foreground">Year</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Aug</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Sep</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Oct</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Nov</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Dec</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Jan</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Feb</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Mar</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Apr</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">May</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Jun</th>
                        <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Jul</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Group months by year
                        const years = Array.from(new Set(Object.keys(metrics.monthlyData).map(key => key.split('-')[0])))
                        
                        if (years.length === 0) {
                          return (
                            <tr>
                              <td colSpan={13} className="p-6 text-center text-muted-foreground">
                                No data available for year summary
                              </td>
                            </tr>
                          )
                        }
                        
                        return years.map(year => {
                          const months = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07']
                          
                          return (
                            <tr key={year} className="border-b border-border hover:bg-muted/50">
                              <td className="p-2 sm:p-3 font-semibold text-foreground">{year}</td>
                              {months.map((monthNum, i) => {
                                const monthKey = `${year}-${monthNum}`
                                const monthData = metrics.monthlyData[monthKey]
                                const value = monthData ? monthData.total : 0
                                const isPositive = value > 0
                                
                                return (
                                  <td key={i} className="p-2 sm:p-3 text-center">
                                    {value !== 0 && (
                                      <span className={`font-medium text-xs sm:text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {value >= 0 ? '' : '-'}₹{Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                      </span>
                                    )}
                                    {value === 0 && <span className="text-muted-foreground text-xs sm:text-sm">0</span>}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 sm:space-y-6 mt-4">
            {/* Detailed Performance Metrics Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Trading Performance</h3>
                <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-border">
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Overall Profit</span>
                        <span className={`text-xs sm:text-sm font-semibold ${metrics.totalLive >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{metrics.totalLive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">No. of Trades</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{metrics.totalTrades}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Average Profit per Trade</span>
                        <span className={`text-xs sm:text-sm font-semibold ${metrics.avgLive >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{metrics.avgLive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Win %</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{metrics.winRateLive.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Loss %</span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{(100 - metrics.winRateLive).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Avg Profit on Winning Trades</span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">₹{metrics.avgWin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Avg Loss on Losing Trades</span>
                        <span className="text-xs sm:text-sm font-semibold text-red-600">₹{metrics.avgLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Max Profit in Single Trade</span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600">₹{metrics.largestWin.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Max Loss in Single Trade</span>
                        <span className="text-xs sm:text-sm font-semibold text-red-600">₹{metrics.largestLoss.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between p-3 sm:p-4">
                        <span className="text-xs sm:text-sm text-muted-foreground">Max Drawdown</span>
                        <span className="text-xs sm:text-sm font-semibold text-red-600">₹{metrics.maxDrawdown.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Risk Metrics</h3>
                <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y divide-border">
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Return/MaxDD</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.returnMaxDD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Reward to Risk Ratio</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.rewardRiskRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Expectancy Ratio</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.expectancyRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Max Win Streak (trades)</span>
                        <span className="text-sm font-semibold text-green-600">{metrics.maxWinStreak}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Max Losing Streak (trades)</span>
                        <span className="text-sm font-semibold text-red-600">{metrics.maxLossStreak}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Max trades in any drawdown</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.tradesInDrawdown}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Profit Factor</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                        <span className="text-sm font-semibold text-foreground">{metrics.sharpeRatio.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4 sm:space-y-6 mt-4">
            {/* Equity Curve Chart */}
            
           {/* Equity Curve Chart */}
           {metrics.cumulativeData.length > 0 && (() => {
              const chartData = metrics.cumulativeData
              const isPositive = metrics.totalLive >= 0
              
              // Add a starting point at zero, then all actual data points
              const startingPoint = {
                date: chartData[0]?.date ? (() => {
                  try {
                    const firstDate = new Date(chartData[0].date)
                    firstDate.setDate(firstDate.getDate() - 1) // One day before first trade
                    return firstDate.toISOString().split('T')[0]
                  } catch {
                    return 'Start'
                  }
                })() : 'Start',
                cumulative: 0,
                daily: 0,
                areaPositive: 0,
                areaNegative: 0
              }
              
              // Build chart with continuous cumulative line and dynamic coloring
              const dataWithSegments = [startingPoint, ...chartData.map((item: any) => {
                const cumulative = typeof item.cumulative === 'number' ? item.cumulative : Number(item.cumulative) || 0
                return {
                  ...item,
                  cumulative,
                  // Calculate areaPositive and areaNegative for gradient fill only (not shown in tooltip)
                  areaPositive: cumulative > 0 ? cumulative : 0,
                  areaNegative: cumulative < 0 ? cumulative : 0,
                }
              })]
              
              // Compute Y-axis domain with proper padding
              const allValues = [0, ...chartData.map((d: any) => Number(d.cumulative) || 0)]
              const yMin = Math.min(...allValues, 0)
              const yMax = Math.max(...allValues, 0)
              const range = yMax - yMin
              const padding = range * 0.1 || Math.max(Math.abs(yMax), Math.abs(yMin)) * 0.1 || 100
              const yPadMin = yMin - padding
              const yPadMax = yMax + padding

              return (
                <Card className="bg-card border-border">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <div>
                        <CardTitle className="text-lg mb-1">Equity Curve - Total MTM</CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            Current: {metrics.totalLive >= 0 ? '+' : ''}₹{metrics.totalLive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">Profit Zone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-muted-foreground">Loss Zone</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={dataWithSegments} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
                        <defs>
                          <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="negativeGradient" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 10, fill: '#9ca3af'}}
                          tickFormatter={(value) => {
                            try {
                              return format(new Date(value), 'dd MMM')
                            } catch {
                              return value
                            }
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis 
                          label={{ value: 'Total MTM (₹)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 12 } }}
                          domain={[yPadMin, yPadMax]}
                          tick={{fontSize: 10, fill: '#9ca3af'}}
                          tickFormatter={(value) => {
                            if (Math.abs(value) >= 1000000) return `₹${(value/1000000).toFixed(1)}M`
                            if (Math.abs(value) >= 1000) return `₹${(value/1000).toFixed(1)}K`
                            return `₹${value.toFixed(0)}`
                          }}
                        />
                        <ReferenceLine y={0} stroke="#f59e0b" strokeWidth={3} label={{ value: '₹0 Baseline', position: 'insideTopRight', fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null
                            
                            // Find only the cumulative item, ignore areaPositive and areaNegative
                            const cumulativeItem = payload.find((item: any) => item.dataKey === 'cumulative')
                            if (!cumulativeItem || !cumulativeItem.payload) return null
                            
                            const payloadData = cumulativeItem.payload
                            const cumulative = payloadData.cumulative || 0
                            const daily = payloadData.daily || 0
                            
                            let formattedLabel = label
                            try {
                              formattedLabel = format(new Date(label), 'EEEE, dd MMM yyyy')
                            } catch {
                              // Keep original label if parsing fails
                            }
                            
                            // Return completely custom tooltip - no default Recharts formatting
                            return (
                              <div style={{
                                backgroundColor: 'rgba(17, 24, 39, 0.98)',
                                color: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                padding: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                              }}>
                                <div style={{ color: '#e5e7eb', fontWeight: 'bold', fontSize: 13, marginBottom: 8 }}>
                                  {formattedLabel}
                                </div>
                                <div className="space-y-1">
                                  <div>Cumulative: <span className={cumulative >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {cumulative >= 0 ? '+' : ''}₹{Number(cumulative).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span></div>
                                  <div>Daily P&L: <span className={daily >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {daily >= 0 ? '+' : ''}₹{Number(daily).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span></div>
                                </div>
                              </div>
                            )
                          }}
                          formatter={() => null}
                          labelFormatter={() => null}
                        />
                        
                        {/* Area fill for positive values */}
                        <Area 
                          type="monotone" 
                          dataKey="areaPositive" 
                          fill="url(#positiveGradient)"
                          stroke="none"
                          fillOpacity={1}
                          baseValue={0}
                          isAnimationActive={false}
                        />
                        
                        {/* Area fill for negative values */}
                        <Area 
                          type="monotone" 
                          dataKey="areaNegative" 
                          fill="url(#negativeGradient)"
                          stroke="none"
                          fillOpacity={1}
                          baseValue={0}
                          isAnimationActive={false}
                        />
                        
                        {/* Main cumulative line that changes color based on position */}
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props
                            const value = payload.cumulative
                            const color = value >= 0 ? '#22c55e' : '#ef4444'
                            return (
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={3} 
                                fill={color} 
                                stroke="#fff" 
                                strokeWidth={1.5}
                              />
                            )
                          }}
                          activeDot={{ 
                            r: 6, 
                            fill: '#3b82f6', 
                            stroke: '#fff', 
                            strokeWidth: 2 
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )
            })()}

          {/* No Data Message */}
            {metrics.cumulativeData.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No Historical Data Available</p>
                <p className="text-muted-foreground">
                  Add historical backtest and live trading data to view analytics
                </p>
              </CardContent>
            </Card>
          )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
