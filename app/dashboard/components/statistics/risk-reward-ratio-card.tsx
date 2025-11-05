'use client'

import { useData } from "@/context/data-provider"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WidgetSize } from '../../types/dashboard'
import { Scale, HelpCircle } from "lucide-react"
import { useI18n } from '@/lib/i18n'
import { useMemo } from "react"

interface RiskRewardRatioCardProps {
  size?: WidgetSize
}

export default function RiskRewardRatioCard({ size = 'tiny' }: RiskRewardRatioCardProps) {
  const { formattedTrades } = useData()
  const t = useI18n()
  
  const { avgWin, avgLoss, riskRewardRatio, profitPercentage } = useMemo(() => {
    // Helper function to parse numeric values
    const parseNumeric = (value: any): number => {
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (!value) return 0
      const str = String(value).replace(/[^0-9.+-]/g, '')
      const num = Number(str)
      return Number.isFinite(num) ? num : 0
    }

    // Collect all P&L values from trades (net of commission)
    const winningValues: number[] = []
    const losingValues: number[] = []

    // Process trades
    formattedTrades.forEach(trade => {
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : parseNumeric(trade.pnl)
      const commission = typeof trade.commission === 'number' ? trade.commission : parseNumeric(trade.commission)
      const netPnL = pnl - commission
      
      if (!isNaN(netPnL)) {
        if (netPnL > 0) {
          winningValues.push(netPnL)
        } else if (netPnL < 0) {
          losingValues.push(Math.abs(netPnL))
        }
      }
    })

    // Calculate averages (use net P&L after commission)
    const avgWin = winningValues.length > 0
      ? winningValues.reduce((sum, val) => sum + val, 0) / winningValues.length
      : 0

    const avgLoss = losingValues.length > 0
      ? losingValues.reduce((sum, val) => sum + val, 0) / losingValues.length
      : 0

    // Calculate Risk-Reward ratio
    const riskRewardRatio = avgLoss > 0 
      ? Number((avgWin / avgLoss).toFixed(2)) 
      : 0
    
    // Calculate progress percentage for visualization
    const totalValue = avgLoss + avgWin
    const profitPercentage = totalValue > 0 
      ? (avgWin / totalValue) * 100 
      : 50

    return { avgWin, avgLoss, riskRewardRatio, profitPercentage }
  }, [formattedTrades])

  return (
    <Card className="h-full">
      <div className="flex flex-col items-center justify-center h-full gap-2 p-2">
        <div className="flex items-center gap-1.5">
          <Scale className="h-3 w-3 text-primary" />
          <span className="font-medium text-sm">RR {riskRewardRatio}</span>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                sideOffset={5} 
                className="max-w-[300px]"
              >
                {t('widgets.riskRewardRatio.tooltip')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full px-1 py-1.5 cursor-pointer">
                <Progress value={profitPercentage} className="h-1.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
              <div className="text-xs space-y-0.5">
                <div className="text-green-500">Avg. Win: ${avgWin.toFixed(2)}</div>
                <div className="text-red-500">Avg. Loss: ${avgLoss.toFixed(2)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  )
} 