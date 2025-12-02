'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/data-provider"
import { calculatePeriodStatistics, PeriodType, PeriodStatistics } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { TrendingUp, TrendingDown, BarChart3, X, Info, CalendarIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import StatisticsWidget from "./statistics-widget"
import { useAuth } from "@/context/auth-provider"
import { listStrategies } from "@/lib/services/strategies"
import { useUserStore } from "@/store/user-store"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FullStatisticsDialogProps {
  trigger?: React.ReactNode
}

export default function FullStatisticsDialog({ trigger }: FullStatisticsDialogProps) {
  const { formattedTrades, statistics, isLoading } = useData()
  const { user } = useAuth()
  const accounts = useUserStore(state => state.accounts || [])
  const [open, setOpen] = React.useState(false)
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodType>('monthly')
  const [strategies, setStrategies] = React.useState<any[]>([])
  const [dateRange, setDateRange] = React.useState<{ from: Date; to?: Date } | undefined>(undefined)
  
  // Fetch strategies when dialog opens
  React.useEffect(() => {
    const fetchStrategies = async () => {
      if (!user?.id || !open) return
      try {
        const strategiesData = await listStrategies({ userId: String(user.id) })
        setStrategies(strategiesData.strategies || [])
      } catch (error) {
        console.error('Error fetching strategies:', error)
      }
    }
    fetchStrategies()
  }, [user?.id, open])

  // Calculate period-based statistics
  const periodStats = React.useMemo(() => {
    // Include strategies even if no trades - calculate from both sources
    const hasTrades = formattedTrades && formattedTrades.length > 0
    const hasStrategies = strategies && strategies.length > 0
    
    if (!hasTrades && !hasStrategies) return []
    
    try {
      return calculatePeriodStatistics(
        formattedTrades || [],
        strategies || [],
        accounts || [],
        selectedPeriod
      )
    } catch (error) {
      console.error('[Full Statistics] Error calculating period stats:', error)
      return []
    }
  }, [formattedTrades, strategies, accounts, selectedPeriod])

  const {
    nbWin,
    nbLoss,
    nbBe,
    nbTrades,
    cumulativePnl,
    cumulativeFees,
    grossWin,
    grossLosses,
    totalPayouts,
    nbPayouts,
    winRate,
    profitFactor,
    averagePositionTime,
    winningStreak
  } = statistics

  const netPnl = (cumulativePnl || 0) - (cumulativeFees || 0) - (totalPayouts || 0)
  const avgWin = (nbWin || 0) > 0 && (grossWin || 0) > 0 ? (grossWin || 0) / (nbWin || 1) : 0
  const avgLoss = (nbLoss || 0) > 0 && (grossLosses || 0) > 0 ? (grossLosses || 0) / (nbLoss || 1) : 0
  const riskRewardRatio = avgLoss > 0 && avgWin > 0 ? Math.abs(avgWin / avgLoss) : 0
  
  // Ensure all values are valid numbers
  const safeWinRate = isNaN(winRate) ? 0 : (winRate || 0)
  const safeProfitFactor = isNaN(profitFactor) ? 0 : (profitFactor || 0)
  const safeNbTrades = nbTrades || 0
  const safeNbWin = nbWin || 0
  const safeNbLoss = nbLoss || 0
  const safeNbBe = nbBe || 0
  const safeGrossWin = grossWin || 0
  const safeGrossLosses = grossLosses || 0
  const safeCumulativePnl = cumulativePnl || 0
  const safeCumulativeFees = cumulativeFees || 0
  const safeTotalPayouts = totalPayouts || 0
  const safeWinningStreak = winningStreak || 0
  const safeAveragePositionTime = averagePositionTime || '0s'

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <BarChart3 className="w-4 h-4" />
      Full Statistics
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="w-6 h-6" />
            Complete Trade Statistics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="period">Period Analysis</TabsTrigger>
                <TabsTrigger value="bydate">By Date</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <StatisticsWidget size="large" />
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Net P&L</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(netPnl)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        After fees & payouts
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Profit Factor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        safeProfitFactor > 1 ? 'text-green-500' : 
                        safeProfitFactor > 0 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {safeProfitFactor === Number.POSITIVE_INFINITY ? '∞' : safeProfitFactor.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Gross Win / Gross Loss
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Risk/Reward</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        riskRewardRatio >= 2 ? 'text-green-500' : 
                        riskRewardRatio >= 1 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {riskRewardRatio.toFixed(2)}:1
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Avg Win / Avg Loss
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Winning Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">
                        {winningStreak}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Current streak
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Period Analysis Tab */}
              <TabsContent value="period" className="space-y-4">
                <div className="flex justify-end">
                  <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodType)}>
                    <TabsList>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {periodStats.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Data</h3>
                      <p className="text-muted-foreground">
                        {(!formattedTrades || formattedTrades.length === 0) && (!strategies || strategies.length === 0)
                          ? 'Start trading or add strategies to see period-based statistics'
                          : 'No data available for the selected period'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total Periods</div>
                          <div className="text-2xl font-bold">{periodStats.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                          <div className={`text-2xl font-bold ${
                            (() => {
                              const total = periodStats.reduce((sum, s) => {
                                const pnl = (s as any).cumulativePnl || 0
                                return sum + (isNaN(pnl) ? 0 : pnl)
                              }, 0)
                              return total >= 0 ? 'text-green-500' : 'text-red-500'
                            })()
                          }`}>
                            {formatCurrency(
                              periodStats.reduce((sum, s) => {
                                const pnl = (s as any).cumulativePnl || 0
                                return sum + (isNaN(pnl) ? 0 : pnl)
                              }, 0)
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                          <div className="text-2xl font-bold">
                            {periodStats.reduce((sum, s) => {
                              const trades = (s as any).nbTrades || 0
                              return sum + (isNaN(trades) ? 0 : trades)
                            }, 0)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Avg Win Rate</div>
                          <div className="text-2xl font-bold text-blue-500">
                            {periodStats.length > 0
                              ? (() => {
                                  const avg = periodStats.reduce((sum, s) => {
                                    const winRate = (s as any).winRate || 0
                                    return sum + (isNaN(winRate) ? 0 : winRate)
                                  }, 0) / periodStats.length
                                  return isNaN(avg) ? '0.0' : avg.toFixed(1)
                                })()
                              : '0.0'}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Period Statistics Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Period</TableHead>
                                  <TableHead className="text-right">P&L</TableHead>
                                  <TableHead className="text-right">Trades</TableHead>
                                  <TableHead className="text-right">Win Rate</TableHead>
                                  <TableHead className="text-right">Wins</TableHead>
                                  <TableHead className="text-right">Losses</TableHead>
                                  <TableHead className="text-right">Profit Factor</TableHead>
                                  <TableHead className="text-right">Fees</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {periodStats.map((stat, index) => {
                                  const s = stat as any
                                  const safePnl = (s.cumulativePnl || 0)
                                  const safeWinRate = isNaN(s.winRate) ? 0 : (s.winRate || 0)
                                  const safeProfitFactor = isNaN(s.profitFactor) ? 0 : (s.profitFactor || 0)
                                  const safeNbTrades = s.nbTrades || 0
                                  const safeNbWin = s.nbWin || 0
                                  const safeNbLoss = s.nbLoss || 0
                                  const safeFees = s.cumulativeFees || 0
                                  
                                  return (
                                    <TableRow key={`${s.period || index}-${index}`}>
                                      <TableCell className="font-medium">{s.periodLabel || s.period || 'N/A'}</TableCell>
                                      <TableCell className={`text-right font-medium ${
                                        safePnl >= 0 ? 'text-green-500' : 'text-red-500'
                                      }`}>
                                        <div className="flex items-center justify-end gap-1">
                                          {safePnl >= 0 ? (
                                            <TrendingUp className="w-4 h-4" />
                                          ) : (
                                            <TrendingDown className="w-4 h-4" />
                                          )}
                                          {formatCurrency(safePnl)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{safeNbTrades}</TableCell>
                                      <TableCell className="text-right">
                                        <Badge variant={safeWinRate >= 50 ? 'default' : 'secondary'}>
                                          {safeWinRate.toFixed(1)}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right text-green-500">{safeNbWin}</TableCell>
                                      <TableCell className="text-right text-red-500">{safeNbLoss}</TableCell>
                                      <TableCell className="text-right">
                                        {safeProfitFactor === Number.POSITIVE_INFINITY ? (
                                          <span className="text-green-500">∞</span>
                                        ) : (
                                          safeProfitFactor.toFixed(2)
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right text-muted-foreground">
                                        {formatCurrency(safeFees)}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* By Date Tab */}
              <TabsContent value="bydate" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Statistics by Date</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          View daily performance breakdown for all trades and strategies
                        </p>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[280px] justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <div className="p-4 space-y-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date()
                                  const lastWeek = new Date()
                                  lastWeek.setDate(today.getDate() - 7)
                                  setDateRange({ from: lastWeek, to: today })
                                }}
                              >
                                Last 7 days
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date()
                                  const lastMonth = new Date()
                                  lastMonth.setMonth(today.getMonth() - 1)
                                  setDateRange({ from: lastMonth, to: today })
                                }}
                              >
                                Last 30 days
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDateRange(undefined)}
                              >
                                Clear
                              </Button>
                            </div>
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from}
                              selected={dateRange as { from: Date; to?: Date } | undefined}
                              onSelect={(range) => setDateRange(range as { from: Date; to?: Date } | undefined)}
                              numberOfMonths={2}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          try {
                            let dailyStats = calculatePeriodStatistics(
                              formattedTrades || [],
                              strategies || [],
                              accounts || [],
                              'daily'
                            )
                            
                            // Filter by date range if selected
                            if (dateRange?.from || dateRange?.to) {
                              dailyStats = dailyStats.filter((stat: any) => {
                                try {
                                  const statDate = new Date(stat.period)
                                  if (isNaN(statDate.getTime())) return false
                                  
                                  // Set time to start of day for comparison
                                  const statDateOnly = new Date(statDate.getFullYear(), statDate.getMonth(), statDate.getDate())
                                  const fromDate = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null
                                  const toDate = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()) : null
                                  
                                  if (fromDate && statDateOnly < fromDate) return false
                                  if (toDate && statDateOnly > toDate) return false
                                  return true
                                } catch {
                                  return false
                                }
                              })
                            }
                            
                            const totalPnl = dailyStats.reduce((sum, s) => {
                              const pnl = (s as any).cumulativePnl || 0
                              return sum + (isNaN(pnl) ? 0 : pnl)
                            }, 0)
                            const profitableDays = dailyStats.filter((s: any) => {
                              const pnl = (s as any).cumulativePnl || 0
                              return !isNaN(pnl) && pnl > 0
                            }).length
                            const losingDays = dailyStats.filter((s: any) => {
                              const pnl = (s as any).cumulativePnl || 0
                              return !isNaN(pnl) && pnl < 0
                            }).length
                            
                            return (
                              <>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Total Days</div>
                                    <div className="text-2xl font-bold">{dailyStats.length}</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                                    <div className={`text-2xl font-bold ${
                                      totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                      {formatCurrency(totalPnl)}
                                    </div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Profitable Days</div>
                                    <div className="text-2xl font-bold text-green-500">{profitableDays}</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Losing Days</div>
                                    <div className="text-2xl font-bold text-red-500">{losingDays}</div>
                                  </CardContent>
                                </Card>
                              </>
                            )
                          } catch (error) {
                            console.error('[Full Statistics] Error calculating daily summary:', error)
                            return (
                              <>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Total Days</div>
                                    <div className="text-2xl font-bold">0</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                                    <div className="text-2xl font-bold">-</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Profitable Days</div>
                                    <div className="text-2xl font-bold">0</div>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="text-sm text-muted-foreground mb-1">Losing Days</div>
                                    <div className="text-2xl font-bold">0</div>
                                  </CardContent>
                                </Card>
                              </>
                            )
                          }
                        })()}
                      </div>

                      {/* Daily Statistics Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">P&L</TableHead>
                                <TableHead className="text-right">Trades</TableHead>
                                <TableHead className="text-right">Wins</TableHead>
                                <TableHead className="text-right">Losses</TableHead>
                                <TableHead className="text-right">Win Rate</TableHead>
                                <TableHead className="text-right">Profit Factor</TableHead>
                                <TableHead className="text-right">Fees</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                try {
                                  let dailyStats = calculatePeriodStatistics(
                                    formattedTrades || [],
                                    strategies || [],
                                    accounts || [],
                                    'daily'
                                  )
                                  
                                  // Filter by date range if selected
                                  if (dateRange?.from || dateRange?.to) {
                                    dailyStats = dailyStats.filter((stat: any) => {
                                      try {
                                        const statDate = new Date(stat.period)
                                        if (isNaN(statDate.getTime())) return false
                                        
                                        // Set time to start of day for comparison
                                        const statDateOnly = new Date(statDate.getFullYear(), statDate.getMonth(), statDate.getDate())
                                        const fromDate = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null
                                        const toDate = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()) : null
                                        
                                        if (fromDate && statDateOnly < fromDate) return false
                                        if (toDate && statDateOnly > toDate) return false
                                        return true
                                      } catch {
                                        return false
                                      }
                                    })
                                  }
                                  
                                  // Show message if no data for selected date range
                                  if (dailyStats.length === 0) {
                                    return (
                                      <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                          {dateRange?.from || dateRange?.to
                                            ? 'No trading data found for the selected date range'
                                            : 'No trading data available'}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  }
                                  
                                  // Sort by date descending (most recent first)
                                  return dailyStats
                                    .sort((a, b) => {
                                      try {
                                        const dateA = new Date((a as any).period)
                                        const dateB = new Date((b as any).period)
                                        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                                          return (b as any).period.localeCompare((a as any).period)
                                        }
                                        return dateB.getTime() - dateA.getTime()
                                      } catch {
                                        return (b as any).period.localeCompare((a as any).period)
                                      }
                                    })
                                    .map((stat, index) => {
                                      const s = stat as any
                                      const safePnl = (s.cumulativePnl || 0)
                                      const safeWinRate = isNaN(s.winRate) ? 0 : (s.winRate || 0)
                                      const safeProfitFactor = isNaN(s.profitFactor) ? 0 : (s.profitFactor || 0)
                                      const safeNbTrades = s.nbTrades || 0
                                      const safeNbWin = s.nbWin || 0
                                      const safeNbLoss = s.nbLoss || 0
                                      const safeFees = s.cumulativeFees || 0
                                      
                                      return (
                                        <TableRow key={`${s.period || index}-${index}`}>
                                          <TableCell className="font-medium">{s.periodLabel || s.period || 'N/A'}</TableCell>
                                          <TableCell className={`text-right font-medium ${
                                            safePnl >= 0 ? 'text-green-500' : 'text-red-500'
                                          }`}>
                                            <div className="flex items-center justify-end gap-1">
                                              {safePnl >= 0 ? (
                                                <TrendingUp className="w-4 h-4" />
                                              ) : (
                                                <TrendingDown className="w-4 h-4" />
                                              )}
                                              {formatCurrency(safePnl)}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">{safeNbTrades}</TableCell>
                                          <TableCell className="text-right text-green-500">{safeNbWin}</TableCell>
                                          <TableCell className="text-right text-red-500">{safeNbLoss}</TableCell>
                                          <TableCell className="text-right">
                                            <Badge variant={safeWinRate >= 50 ? 'default' : 'secondary'}>
                                              {safeWinRate.toFixed(1)}%
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {safeProfitFactor === Number.POSITIVE_INFINITY ? (
                                              <span className="text-green-500">∞</span>
                                            ) : (
                                              safeProfitFactor.toFixed(2)
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(safeFees)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })
                                } catch (error) {
                                  console.error('[Full Statistics] Error rendering daily stats:', error)
                                  return (
                                    <TableRow>
                                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        Error loading daily statistics
                                      </TableCell>
                                    </TableRow>
                                  )
                                }
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Win/Loss Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Winning Trades</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">{safeNbWin}</span>
                          <span className="text-sm text-muted-foreground">
                            ({safeNbTrades > 0 ? ((safeNbWin / safeNbTrades) * 100).toFixed(1) : '0.0'}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Losing Trades</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">{safeNbLoss}</span>
                          <span className="text-sm text-muted-foreground">
                            ({safeNbTrades > 0 ? ((safeNbLoss / safeNbTrades) * 100).toFixed(1) : '0.0'}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Break Even</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-bold">{safeNbBe}</span>
                          <span className="text-sm text-muted-foreground">
                            ({safeNbTrades > 0 ? ((safeNbBe / safeNbTrades) * 100).toFixed(1) : '0.0'}%)
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Trades</span>
                          <span className="font-bold text-lg">{safeNbTrades}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>P&L Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Gross Profit</span>
                        <span className="text-green-500 font-bold">{formatCurrency(safeGrossWin)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Gross Loss</span>
                        <span className="text-red-500 font-bold">-{formatCurrency(safeGrossLosses)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Fees</span>
                        <span className="text-red-500 font-bold">-{formatCurrency(safeCumulativeFees)}</span>
                      </div>
                      {(nbPayouts || 0) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Payouts ({nbPayouts || 0})</span>
                          <span className="text-red-500 font-bold">-{formatCurrency(safeTotalPayouts)}</span>
                        </div>
                      )}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Net P&L</span>
                          <span className={`font-bold text-lg ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(netPnl)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Average Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Win</span>
                        <span className="text-green-500 font-bold">{formatCurrency(avgWin)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Loss</span>
                        <span className="text-red-500 font-bold">-{formatCurrency(avgLoss)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Average Position Time</span>
                        <span className="font-bold">{safeAveragePositionTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Risk/Reward Ratio</span>
                        <span className={`font-bold ${
                          riskRewardRatio >= 2 ? 'text-green-500' : 
                          riskRewardRatio >= 1 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {isNaN(riskRewardRatio) ? '0.00' : riskRewardRatio.toFixed(2)}:1
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Win Rate</span>
                        <span className="text-blue-500 font-bold">{safeWinRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Profit Factor</span>
                        <span className={`font-bold ${
                          safeProfitFactor > 1 ? 'text-green-500' : 
                          safeProfitFactor > 0 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {safeProfitFactor === Number.POSITIVE_INFINITY ? '∞' : safeProfitFactor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Winning Streak</span>
                        <span className="text-blue-500 font-bold">{safeWinningStreak}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Cumulative P&L</span>
                        <span className={`font-bold ${safeCumulativePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(safeCumulativePnl)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Detailed Stats Tab */}
              <TabsContent value="detailed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Statistics Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Trade Counts</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Trades</span>
                            <span className="font-medium">{safeNbTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Wins</span>
                            <span className="font-medium text-green-500">{safeNbWin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Losses</span>
                            <span className="font-medium text-red-500">{safeNbLoss}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Break Even</span>
                            <span className="font-medium">{safeNbBe}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">P&L Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Gross Profit</span>
                            <span className="font-medium text-green-500">{formatCurrency(safeGrossWin)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Gross Loss</span>
                            <span className="font-medium text-red-500">{formatCurrency(safeGrossLosses)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Fees</span>
                            <span className="font-medium">{formatCurrency(safeCumulativeFees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Net P&L</span>
                            <span className={`font-medium ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatCurrency(netPnl)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Performance Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Win Rate</span>
                            <span className="font-medium">{safeWinRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Profit Factor</span>
                            <span className="font-medium">
                              {safeProfitFactor === Number.POSITIVE_INFINITY ? '∞' : safeProfitFactor.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Risk/Reward</span>
                            <span className="font-medium">{isNaN(riskRewardRatio) ? '0.00' : riskRewardRatio.toFixed(2)}:1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Avg Position Time</span>
                            <span className="font-medium">{safeAveragePositionTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

