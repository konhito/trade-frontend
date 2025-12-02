'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/context/data-provider"
import { calculatePeriodStatistics, PeriodType, PeriodStatistics } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { TrendingUp, TrendingDown, Calendar, BarChart3, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-provider"
import { listStrategies } from "@/lib/services/strategies"
import { useUserStore } from "@/store/user-store"

export default function PeriodStatisticsComponent() {
  const { formattedTrades, isLoading } = useData()
  const { user } = useAuth()
  const accounts = useUserStore(state => state.accounts || [])
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodType>('monthly')
  const [strategies, setStrategies] = React.useState<any[]>([])
  const [strategiesLoading, setStrategiesLoading] = React.useState(false)

  // Fetch strategies
  React.useEffect(() => {
    const fetchStrategies = async () => {
      if (!user?.id) return
      setStrategiesLoading(true)
      try {
        const strategiesData = await listStrategies({ userId: String(user.id) })
        setStrategies(strategiesData.strategies || [])
      } catch (error) {
        console.error('Error fetching strategies:', error)
      } finally {
        setStrategiesLoading(false)
      }
    }
    fetchStrategies()
  }, [user?.id])

  // Calculate period-based statistics
  const periodStats = React.useMemo(() => {
    // Include strategies even if no trades - calculate from both sources
    const hasTrades = formattedTrades && formattedTrades.length > 0
    const hasStrategies = strategies && strategies.length > 0
    
    if (!hasTrades && !hasStrategies) return []
    
    try {
      const stats = calculatePeriodStatistics(
        formattedTrades || [],
        strategies || [],
        accounts || [],
        selectedPeriod
      )
      console.log('[Period Statistics] Calculated stats:', {
        periodType: selectedPeriod,
        statsCount: stats.length,
        hasTrades,
        hasStrategies,
        tradesCount: formattedTrades?.length || 0,
        strategiesCount: strategies?.length || 0,
        sampleStat: stats[0]
      })
      return stats
    } catch (error) {
      console.error('[Period Statistics] Error calculating stats:', error)
      return []
    }
  }, [formattedTrades, strategies, accounts, selectedPeriod])

  if (isLoading || strategiesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (periodStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Period Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Data</h3>
            <p className="text-muted-foreground">Start trading to see period-based statistics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Period Statistics
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodType)} className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>
        <div className="space-y-4">
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

          {/* Statistics Table */}
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

          {/* Detailed View Toggle */}
          <div className="text-sm text-muted-foreground">
            Showing {periodStats.length} {selectedPeriod} period{periodStats.length !== 1 ? 's' : ''}
          </div>
        </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

