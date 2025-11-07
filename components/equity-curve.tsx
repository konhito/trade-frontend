  'use client'

import React from 'react'
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { format } from 'date-fns'

export type EquityCurveTrade = {
  pnl?: number | string
  commission?: number | string
  entryDate?: string
  createdAt?: string
  date?: string
}

interface StrategyWithHistory {
  historicalData?: {
    entries?: Array<{ date?: string; day?: string; live?: number | string; backtest?: number | string }>
  }
}

interface EquityCurveProps {
  trades?: EquityCurveTrade[] | null | undefined
  strategies?: StrategyWithHistory[] | null | undefined
  rangeDays?: number
  dailyPnLData?: Array<{ name: string; pnl: number; isProfit: boolean }> | null | undefined
}

export function EquityCurve({ trades, strategies, rangeDays, dailyPnLData }: EquityCurveProps) {
  // Detect mobile screen size
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Robust numeric parser
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (!value) return 0
    const str = String(value).replace(/[^0-9.+-]/g, '')
    const num = Number(str)
    return Number.isFinite(num) ? num : 0
  }

  // Helper function to parse date strings (MMM dd format) to yyyy-MM-dd
  const parseDateWithMonthName = (dateStr: string, year: number): Date => {
    const months: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    }
    const parts = dateStr.split(' ')
    const month = months[parts[0]] ?? 0
    const day = parseInt(parts[1]) || 1
    return new Date(year, month, day)
  }

  // Aggregate by day and compute cumulative
  const { dataWithSegments, yPadMin, yPadMax } = React.useMemo(() => {
    // If dailyPnLData is provided, use it directly
    if (dailyPnLData && dailyPnLData.length > 0) {
      const currentYear = new Date().getFullYear()
      const cumulativeData = dailyPnLData
        .map(item => {
          // Parse "MMM dd" format to Date
          const date = parseDateWithMonthName(item.name, currentYear)
          const dateKey = format(date, 'yyyy-MM-dd')
          return {
            date: dateKey,
            daily: item.pnl,
            cumulative: 0 // Will calculate below
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((acc: any[], item: any, index: number) => {
          const prev = acc[index - 1] || { cumulative: 0 }
          acc.push({
            ...item,
            cumulative: prev.cumulative + item.daily
          })
          return acc
        }, [])

      // Include starting point at zero one day before first trade
      const withStart = (() => {
        if (cumulativeData.length === 0) return [] as any[]
        try {
          const first = new Date(cumulativeData[0].date)
          first.setDate(first.getDate() - 1)
          const start = { date: first.toISOString().slice(0, 10), cumulative: 0, daily: 0 }
          return [start, ...cumulativeData]
        } catch {
          return cumulativeData
        }
      })()

      const dataWithSegments = withStart.map((item: any) => {
        const cumulative = Number(item.cumulative) || 0
        const { areaPositive, areaNegative, ...rest } = item
        return {
          ...rest,
          cumulative,
        }
      })

      const allValues = withStart.map((d: any) => Number(d.cumulative) || 0).concat(0)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const range = Math.max(1, max - min)
      const pad = range * 0.1
      return {
        dataWithSegments,
        yPadMin: min - pad,
        yPadMax: max + pad,
      }
    }

    // Otherwise, fall back to calculating from trades and strategies
    const dailyTotals: Record<string, number> = {}
    // Include user trades
    ;(trades || []).forEach((t) => {
      // Ensure P&L is properly parsed (handles negative values correctly)
      const tradePnL = parseNumeric(t.pnl)
      const tradeCommission = parseNumeric(t.commission)
      const pnl = tradePnL - tradeCommission
      // Skip only if P&L is invalid (NaN), but allow negative values and zero
      if (isNaN(pnl)) return
      
      const raw = (t.entryDate || t.createdAt || t.date || '') as any
      let dayKey = ''
      try {
        const d = new Date(raw)
        if (!isNaN(d.getTime())) {
          dayKey = format(d, 'yyyy-MM-dd')
        } else if (typeof raw === 'string' && raw.length >= 10) {
          dayKey = raw.slice(0, 10)
        }
      } catch {
        if (typeof raw === 'string' && raw.length >= 10) dayKey = raw.slice(0, 10)
      }
      if (!dayKey) return
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + pnl
    })

    // Include strategies historical live entries as virtual trades
    ;(strategies || []).forEach((s) => {
      const entries = s?.historicalData?.entries || []
      entries.forEach((e) => {
        const raw = e.date || e.day || ''
        let dayKey = ''
        try {
          const d = new Date(raw as any)
          if (!isNaN(d.getTime())) {
            dayKey = format(d, 'yyyy-MM-dd')
          } else if (typeof raw === 'string' && raw.length >= 10) {
            dayKey = String(raw).slice(0, 10)
          }
        } catch {
          if (typeof raw === 'string' && raw.length >= 10) dayKey = String(raw).slice(0, 10)
        }
        if (!dayKey) return
        const live = parseNumeric(e.live)
        // Skip only if P&L is invalid (NaN), but allow negative values and zero
        if (isNaN(live)) return
        dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + live
      })
    })

    let sortedDays = Object.keys(dailyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    // Optional filter to last N days
    if (rangeDays && rangeDays > 0) {
      const today = new Date(); today.setHours(0,0,0,0)
      const from = new Date(today); from.setDate(from.getDate() - rangeDays)
      sortedDays = sortedDays.filter(d => {
        const dt = new Date(d)
        dt.setHours(0,0,0,0)
        return dt >= from && dt <= today
      })
    }
    const cumulativeData = sortedDays.reduce((acc: any[], day: string) => {
      const prev = acc[acc.length - 1] || { cumulative: 0 }
      const daily = dailyTotals[day] || 0
      acc.push({ date: day, cumulative: prev.cumulative + daily, daily })
      return acc
    }, [])

    // Include starting point at zero one day before first trade (optional)
    const withStart = (() => {
      if (cumulativeData.length === 0) return [] as any[]
      try {
        const first = new Date(cumulativeData[0].date)
        first.setDate(first.getDate() - 1)
        const start = { date: first.toISOString().slice(0, 10), cumulative: 0, daily: 0 }
        return [start, ...cumulativeData]
      } catch {
        return cumulativeData
      }
    })()

    const dataWithSegments = withStart.map((item) => {
      const cumulative = Number(item.cumulative) || 0
      const { areaPositive, areaNegative, ...rest } = item
      return {
        ...rest,
        cumulative,
      }
    })

    const allValues = withStart.map((d) => Number(d.cumulative) || 0).concat(0)
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const range = Math.max(1, max - min)
    const pad = range * 0.1
    return {
      dataWithSegments,
      yPadMin: min - pad,
      yPadMax: max + pad,
    }
  }, [trades, strategies, dailyPnLData, rangeDays])

  if (!dataWithSegments || dataWithSegments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center text-sm">Add trades to see equity curve</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart 
        data={dataWithSegments} 
        margin={isMobile ? { top: 10, right: 10, left: 50, bottom: 50 } : { top: 10, right: 20, left: 60, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: isMobile ? 8 : 9, fill: '#9ca3af' }}
          tickFormatter={(value) => {
            try { return format(new Date(value), isMobile ? 'dd/MM' : 'dd MMM') } catch { return value }
          }}
          angle={isMobile ? -90 : -45}
          textAnchor={isMobile ? 'middle' : 'end'}
          height={isMobile ? 80 : 60}
          interval="preserveStartEnd"
        />
        <YAxis
          label={{ value: 'Total MTM (₹)', angle: -90, position: 'left', offset: 10, style: { fill: '#9ca3af', fontSize: isMobile ? 9 : 11 } }}
          domain={[yPadMin, yPadMax]}
          tick={{ fontSize: isMobile ? 8 : 9, fill: '#9ca3af' }}
          width={isMobile ? 50 : 50}
          tickFormatter={(value: number) => {
            if (Math.abs(value) >= 1000000) return `₹${(value/1000000).toFixed(1)}M`
            if (Math.abs(value) >= 1000) return `₹${(value/1000).toFixed(1)}K`
            return `₹${value.toFixed(0)}`
          }}
        />
        <ReferenceLine y={0} stroke="#f59e0b" strokeWidth={3} label={{ value: '₹0 Baseline', position: 'insideTopRight', fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }} />
        <Tooltip
          cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload || payload.length === 0) return null
            
            // Find only the cumulative item, ignore everything else
            const cumulativeItem = payload.find((item: any) => item.dataKey === 'cumulative')
            if (!cumulativeItem || !cumulativeItem.payload) return null
            
            // Get data from payload, explicitly only using cumulative and daily
            const payloadData = cumulativeItem.payload
            const cumulative = payloadData.cumulative || 0
            const daily = payloadData.daily || 0
            const sign = cumulative >= 0 ? '+' : '-'
            const formattedCumulative = `${sign}₹${Math.abs(Number(cumulative)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            const dailySign = daily >= 0 ? '+' : '-'
            const formattedDaily = `${dailySign}₹${Math.abs(Number(daily)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            
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
                borderRadius: 8,
                border: '1px solid #374151',
                padding: 12,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                  {formattedLabel}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: cumulative >= 0 ? '#22c55e' : '#ef4444', marginBottom: 6 }}>
                  Cumulative: {formattedCumulative}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: daily >= 0 ? '#22c55e' : '#ef4444' }}>
                  Daily P&L: {formattedDaily}
                </div>
              </div>
            )
          }}
          formatter={() => null}
          labelFormatter={() => null}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={(props: any) => {
            const { cx, cy, payload } = props
            const color = payload.cumulative >= 0 ? '#22c55e' : '#ef4444'
            return <circle cx={cx} cy={cy} r={3} fill={color} stroke="#fff" strokeWidth={1.5} />
          }}
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default EquityCurve


