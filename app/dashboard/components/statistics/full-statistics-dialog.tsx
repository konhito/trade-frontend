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
import { TrendingUp, TrendingDown, BarChart3, X, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import StatisticsWidget from "./statistics-widget"
import { useAuth } from "@/context/auth-provider"
import { listStrategies } from "@/lib/services/strategies"
import { useUserStore } from "@/store/user-store"

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
    if (!formattedTrades || formattedTrades.length === 0) return []
    return calculatePeriodStatistics(
      formattedTrades,
      strategies || [],
      accounts || [],
      selectedPeriod
    )
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

  const netPnl = cumulativePnl - cumulativeFees - totalPayouts
  const avgWin = nbWin > 0 ? grossWin / nbWin : 0
  const avgLoss = nbLoss > 0 ? grossLosses / nbLoss : 0
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="period">Period Analysis</TabsTrigger>
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
                        profitFactor > 1 ? 'text-green-500' : 
                        profitFactor > 0 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {profitFactor === Number.POSITIVE_INFINITY ? '∞' : profitFactor.toFixed(2)}
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
                      <p className="text-muted-foreground">No trading data available</p>
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
                            periodStats.reduce((sum, s) => sum + (s as any).cumulativePnl, 0) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {formatCurrency(periodStats.reduce((sum, s) => sum + (s as any).cumulativePnl, 0))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                          <div className="text-2xl font-bold">
                            {periodStats.reduce((sum, s) => sum + ((s as any).nbTrades || 0), 0)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground mb-1">Avg Win Rate</div>
                          <div className="text-2xl font-bold text-blue-500">
                            {periodStats.length > 0
                              ? (periodStats.reduce((sum, s) => sum + (s as any).winRate, 0) / periodStats.length).toFixed(1)
                              : '0'}%
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
                                  return (
                                    <TableRow key={`${s.period}-${index}`}>
                                      <TableCell className="font-medium">{s.periodLabel}</TableCell>
                                      <TableCell className={`text-right font-medium ${
                                        s.cumulativePnl >= 0 ? 'text-green-500' : 'text-red-500'
                                      }`}>
                                        <div className="flex items-center justify-end gap-1">
                                          {s.cumulativePnl >= 0 ? (
                                            <TrendingUp className="w-4 h-4" />
                                          ) : (
                                            <TrendingDown className="w-4 h-4" />
                                          )}
                                          {formatCurrency(s.cumulativePnl)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{s.nbTrades}</TableCell>
                                      <TableCell className="text-right">
                                        <Badge variant={s.winRate >= 50 ? 'default' : 'secondary'}>
                                          {s.winRate.toFixed(1)}%
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right text-green-500">{s.nbWin}</TableCell>
                                      <TableCell className="text-right text-red-500">{s.nbLoss}</TableCell>
                                      <TableCell className="text-right">
                                        {s.profitFactor === Number.POSITIVE_INFINITY ? (
                                          <span className="text-green-500">∞</span>
                                        ) : (
                                          s.profitFactor.toFixed(2)
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right text-muted-foreground">
                                        {formatCurrency(s.cumulativeFees)}
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
                          <span className="text-green-500 font-bold">{nbWin}</span>
                          <span className="text-sm text-muted-foreground">
                            ({((nbWin / nbTrades) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Losing Trades</span>
                        <div className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">{nbLoss}</span>
                          <span className="text-sm text-muted-foreground">
                            ({((nbLoss / nbTrades) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Break Even</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-bold">{nbBe}</span>
                          <span className="text-sm text-muted-foreground">
                            ({((nbBe / nbTrades) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Trades</span>
                          <span className="font-bold text-lg">{nbTrades}</span>
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
                        <span className="text-green-500 font-bold">{formatCurrency(grossWin)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Gross Loss</span>
                        <span className="text-red-500 font-bold">-{formatCurrency(grossLosses)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Fees</span>
                        <span className="text-red-500 font-bold">-{formatCurrency(cumulativeFees)}</span>
                      </div>
                      {nbPayouts > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Payouts ({nbPayouts})</span>
                          <span className="text-red-500 font-bold">-{formatCurrency(totalPayouts)}</span>
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
                        <span className="font-bold">{averagePositionTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Risk/Reward Ratio</span>
                        <span className={`font-bold ${
                          riskRewardRatio >= 2 ? 'text-green-500' : 
                          riskRewardRatio >= 1 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {riskRewardRatio.toFixed(2)}:1
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
                        <span className="text-blue-500 font-bold">{winRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Profit Factor</span>
                        <span className={`font-bold ${
                          profitFactor > 1 ? 'text-green-500' : 
                          profitFactor > 0 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}>
                          {profitFactor === Number.POSITIVE_INFINITY ? '∞' : profitFactor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Winning Streak</span>
                        <span className="text-blue-500 font-bold">{winningStreak}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Cumulative P&L</span>
                        <span className={`font-bold ${cumulativePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(cumulativePnl)}
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
                            <span className="font-medium">{nbTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Wins</span>
                            <span className="font-medium text-green-500">{nbWin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Losses</span>
                            <span className="font-medium text-red-500">{nbLoss}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Break Even</span>
                            <span className="font-medium">{nbBe}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">P&L Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Gross Profit</span>
                            <span className="font-medium text-green-500">{formatCurrency(grossWin)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Gross Loss</span>
                            <span className="font-medium text-red-500">{formatCurrency(grossLosses)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Fees</span>
                            <span className="font-medium">{formatCurrency(cumulativeFees)}</span>
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
                            <span className="font-medium">{winRate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Profit Factor</span>
                            <span className="font-medium">
                              {profitFactor === Number.POSITIVE_INFINITY ? '∞' : profitFactor.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Risk/Reward</span>
                            <span className="font-medium">{riskRewardRatio.toFixed(2)}:1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Avg Position Time</span>
                            <span className="font-medium">{averagePositionTime}</span>
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

