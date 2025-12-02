"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/context/data-provider"
import { Clock, PiggyBank, Award, BarChart, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency"
import { Progress } from "@/components/ui/progress"

interface StatisticsWidgetProps {
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'small-long' | 'extra-large'
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function StatisticsWidget({ size = 'medium' }: StatisticsWidgetProps) {
  const { statistics, calendarData } = useData()
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null)
  const [isTouch, setIsTouch] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const lastTouchTime = React.useRef(0)

  // Calculate statistics
  const { 
    nbWin, nbLoss, nbBe, nbTrades, 
    averagePositionTime, 
    cumulativePnl, cumulativeFees,
    winningStreak,
    grossLosses,
    grossWin,
    totalPayouts,
    nbPayouts
  } = statistics

  // Calculate Net P&L including payouts
  const netPnlWithPayouts = cumulativePnl - cumulativeFees - totalPayouts

  // Calculate rates (handle division by zero)
  const winRate = nbTrades > 0 ? Number((nbWin / nbTrades * 100).toFixed(2)) : 0
  const lossRate = nbTrades > 0 ? Number((nbLoss / nbTrades * 100).toFixed(2)) : 0
  const beRate = nbTrades > 0 ? Number((nbBe / nbTrades * 100).toFixed(2)) : 0

  // Calculate long/short data
  const chartData = Object.entries(calendarData).map(([date, values]) => ({
    date,
    pnl: values.pnl,
    shortNumber: values.shortNumber,
    longNumber: values.longNumber,
  }))

  const longNumber = chartData.reduce((acc, curr) => acc + curr.longNumber, 0)
  const shortNumber = chartData.reduce((acc, curr) => acc + curr.shortNumber, 0)
  const totalTrades = longNumber + shortNumber
  const longRate = totalTrades > 0 ? Number((longNumber / totalTrades * 100).toFixed(2)) : 0
  const shortRate = totalTrades > 0 ? Number((shortNumber / totalTrades * 100).toFixed(2)) : 0

  // Colors
  const positiveColor = "hsl(var(--chart-2))"
  const negativeColor = "hsl(var(--chart-1))"
  const neutralColor = "hsl(var(--muted))"

  // Performance data
  const performanceData = [
    { name: 'Win', value: winRate, color: positiveColor },
    { name: 'BE', value: beRate, color: neutralColor },
    { name: 'Loss', value: lossRate, color: negativeColor },
  ]

  // Long/Short data
  const sideData = [
    { name: 'Long', value: longRate, color: positiveColor, number: longNumber },
    { name: 'Short', value: shortRate, color: negativeColor, number: shortNumber },
  ]

  // Touch event handlers
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActiveTooltip(null)
      }
    }

    const handleTouchStart = () => {
      setIsTouch(true)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    window.addEventListener('touchstart', handleTouchStart, { once: true })

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  return (
    <Card className="h-full flex flex-col" ref={cardRef}>
      <CardHeader 
        className={cn(
          "flex-none border-b",
          size === 'tiny' 
            ? "py-1 px-2"
            : (size === 'small' || size === 'small-long')
              ? "py-2 px-3" 
              : "py-3 px-4"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle 
              className={cn(
                "line-clamp-1",
                size === 'tiny'
                  ? "text-xs"
                  : (size === 'small' || size === 'small-long') 
                    ? "text-sm" 
                    : "text-base"
              )}
            >
              Statistics
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete trading statistics including trades and strategies</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <BarChart className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="grid h-full grid-cols-2">
          {/* Profit/Loss Section */}
          <div className={cn(
            "flex flex-col border-r border-b",
            size === 'tiny' ? "p-1.5" : "p-3"
          )}>
            <h3 className="text-xs font-medium mb-1.5">Profit/Loss</h3>
            <div className="flex-1 flex flex-col justify-center gap-0.5">
              {/* Profits */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Profits</span>
                <span className="text-xs font-medium text-green-500 font-mono">{formatCurrency(grossWin)}</span>
              </div>
              
              {/* Losses */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">- Losses</span>
                <span className="text-xs font-medium text-red-500 font-mono">{formatCurrency(grossLosses)}</span>
              </div>
              
              {/* Fees */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">- Fees</span>
                <span className="text-xs font-medium text-red-500 font-mono">{formatCurrency(cumulativeFees)}</span>
              </div>
              
              {/* Payouts */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">- Payouts ({nbPayouts})</span>
                <span className="text-xs font-medium text-red-500 font-mono">{formatCurrency(totalPayouts)}</span>
              </div>
              
              {/* Divider */}
              <div className="border-t border-dashed my-1"></div>
              
              {/* Net Result */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs font-medium">Net</span>
                <span className={cn(
                  "text-sm font-bold font-mono",
                  netPnlWithPayouts > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(netPnlWithPayouts)}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className={cn(
            "flex flex-col border-b",
            size === 'tiny' ? "p-1.5" : "p-3"
          )}>
            <h3 className="text-xs font-medium mb-1.5">Performance</h3>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Win Rate</span>
                <span className="text-sm font-medium">{isNaN(winRate) ? '0' : winRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Avg Win</span>
                <span className="text-sm font-medium text-green-500 font-mono">{nbWin > 0 ? formatCurrency(grossWin / nbWin) : formatCurrency(0)}</span>
              </div>
              {size !== 'tiny' && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Avg Loss</span>
                  <span className="text-sm font-medium text-red-500 font-mono">{nbLoss > 0 ? `-${formatCurrency(grossLosses / nbLoss)}` : formatCurrency(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className={cn(
            "flex flex-col border-r",
            size === 'tiny' ? "p-1.5" : "p-3"
          )}>
            <h3 className="text-xs font-medium mb-1.5">Activity</h3>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Total Trades</span>
                <span className="text-sm font-medium">{nbTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Winning Trades</span>
                <span className="text-sm font-medium text-green-500">{nbWin}</span>
              </div>
              {size !== 'tiny' && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Avg Duration</span>
                  <span className="text-sm font-medium">{averagePositionTime || '0s'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Section */}
          <div className={cn(
            "flex flex-col",
            size === 'tiny' ? "p-1.5" : "p-3"
          )}>
            <h3 className="text-xs font-medium mb-1.5">Distribution</h3>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Long</span>
                  <span className="text-sm font-medium">{isNaN(longRate) ? '0' : longRate}%</span>
                </div>
                <Progress value={isNaN(longRate) ? 0 : longRate} className="h-1" />
              </div>
              {size !== 'tiny' ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Short</span>
                      <span className="text-sm font-medium">{isNaN(shortRate) ? '0' : shortRate}%</span>
                    </div>
                    <Progress value={isNaN(shortRate) ? 0 : shortRate} className="h-1" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Winning Streak</span>
                    <span className="text-sm font-medium">{winningStreak}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">Winning Streak</span>
                  <span className="text-sm font-medium">{winningStreak}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 