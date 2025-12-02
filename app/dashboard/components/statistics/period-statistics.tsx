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

export default function PeriodStatisticsComponent() {
  const { formattedTrades, strategies, accounts, isLoading } = useData()
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodType>('monthly')

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

  if (isLoading) {
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
                  periodStats.reduce((sum, s) => sum + s.cumulativePnl, 0) >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {formatCurrency(periodStats.reduce((sum, s) => sum + s.cumulativePnl, 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                <div className="text-2xl font-bold">
                  {periodStats.reduce((sum, s) => sum + s.nbTrades, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Win Rate</div>
                <div className="text-2xl font-bold text-blue-500">
                  {periodStats.length > 0
                    ? (periodStats.reduce((sum, s) => sum + s.winRate, 0) / periodStats.length).toFixed(1)
                    : '0'}%
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
                  {periodStats.map((stat, index) => (
                    <TableRow key={`${stat.period}-${index}`}>
                      <TableCell className="font-medium">{stat.periodLabel}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        stat.cumulativePnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <div className="flex items-center justify-end gap-1">
                          {stat.cumulativePnl >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {formatCurrency(stat.cumulativePnl)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{stat.nbTrades}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={stat.winRate >= 50 ? 'default' : 'secondary'}>
                          {stat.winRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-500">{stat.nbWin}</TableCell>
                      <TableCell className="text-right text-red-500">{stat.nbLoss}</TableCell>
                      <TableCell className="text-right">
                        {stat.profitFactor === Number.POSITIVE_INFINITY ? (
                          <span className="text-green-500">∞</span>
                        ) : (
                          stat.profitFactor.toFixed(2)
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(stat.cumulativeFees)}
                      </TableCell>
                    </TableRow>
                  ))}
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

