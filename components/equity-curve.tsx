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
  trades: EquityCurveTrade[] | null | undefined
  strategies?: StrategyWithHistory[] | null | undefined
}

export function EquityCurve({ trades, strategies }: EquityCurveProps) {
  // Robust numeric parser
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (!value) return 0
    const str = String(value).replace(/[^0-9.+-]/g, '')
    const num = Number(str)
    return Number.isFinite(num) ? num : 0
  }

  // Aggregate by day and compute cumulative
  const { dataWithSegments, yPadMin, yPadMax } = React.useMemo(() => {
    const dailyTotals: Record<string, number> = {}
    // Include user trades
    ;(trades || []).forEach((t) => {
      const pnl = parseNumeric(t.pnl) - parseNumeric(t.commission)
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
        if (!live) return
        dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + live
      })
    })

    const sortedDays = Object.keys(dailyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
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
      return {
        ...item,
        cumulative,
        areaPositive: Math.max(cumulative, 0),
        areaNegative: Math.min(cumulative, 0),
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
  }, [trades])

  if (!dataWithSegments || dataWithSegments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-center text-sm">Add trades to see equity curve</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
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
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickFormatter={(value) => {
            try { return format(new Date(value), 'dd MMM') } catch { return value }
          }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          label={{ value: 'Total MTM (₹)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 12 } }}
          domain={[yPadMin, yPadMax]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickFormatter={(value: number) => {
            if (Math.abs(value) >= 1000000) return `₹${(value/1000000).toFixed(1)}M`
            if (Math.abs(value) >= 1000) return `₹${(value/1000).toFixed(1)}K`
            return `₹${value.toFixed(0)}`
          }}
        />
        <ReferenceLine y={0} stroke="#f59e0b" strokeWidth={3} label={{ value: '₹0 Baseline', position: 'insideTopRight', fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.98)', color: '#fff', borderRadius: 8, border: '1px solid #374151', padding: 12 }}
          formatter={(value: any, name, props: any) => {
            const { cumulative, daily } = props.payload
            if (name === 'cumulative') {
              return [
                `Cumulative: ${cumulative >= 0 ? '+' : ''}₹${Number(cumulative).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\nDaily: ${daily >= 0 ? '+' : ''}₹${Number(daily).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                ''
              ]
            }
            return null
          }}
          labelFormatter={(label) => {
            try { return format(new Date(label), 'EEEE, dd MMM yyyy') } catch { return label }
          }}
        />
        <Area type="monotone" dataKey="areaPositive" fill="url(#positiveGradient)" stroke="none" fillOpacity={1} baseValue={0} />
        <Area type="monotone" dataKey="areaNegative" fill="url(#negativeGradient)" stroke="none" fillOpacity={1} baseValue={0} />
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


