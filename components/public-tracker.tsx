'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import Link from 'next/link'
import { format as formatDate } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Filter,
  Layers3,
  Menu,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatMoney, formatPercent, trackerApi, trackerWeekdays, type TrackerData, type TrackerEntry } from '@/lib/public-tracker'
import { getWeeklyPnl } from '@/lib/weekly-pnl'
import { getTrackerStatistics } from '@/lib/tracker-statistics'

type Point = { date: string; pnl: number; drawdown?: number }
const lotOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const weekdayPreset = trackerWeekdays.slice(0, 5).map(({ value }) => value)

const headingFont = Archivo({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--tracker-heading' })
const dataFont = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--tracker-data' })
const panel = 'rounded-[20px] border border-[#dce3e1] bg-white p-[clamp(1rem,2vw,1.5rem)]'
const positive = (value: number) => value < 0 ? 'text-[#b64b48]' : 'text-[#16795d]'

function getCurrentTradingDate() {
  const date = new Date()
  date.setDate(date.getDate() - (date.getDay() === 0 ? 2 : date.getDay() === 6 ? 1 : 0))
  return formatDate(date, 'yyyy-MM-dd')
}

function Chart({ points, drawdown = false }: { points: Point[]; drawdown?: boolean }) {
  const data = useMemo(() => {
    let balance = 0
    return points.map((point) => ({
      date: point.date,
      value: drawdown ? (point.drawdown ?? 0) : (balance += point.pnl),
    }))
  }, [points, drawdown])

  return (
    <div className="h-64 w-full" role="img" aria-label={drawdown ? 'Drawdown over time' : 'Cumulative profit and loss over time'}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 16 }}>
          <CartesianGrid stroke="#e7ece9" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(0, 7)} minTickGap={38} tick={{ fill: '#6f7d81', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value: number) => formatMoney(value)} width={82} tick={{ fill: '#6f7d81', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(date) => `Date: ${date}`} contentStyle={{ border: '1px solid #dce3e1', borderRadius: 12, boxShadow: '0 8px 24px rgba(21, 38, 43, .12)' }} />
          <Line type="monotone" dataKey="value" name={drawdown ? 'Drawdown' : 'Cumulative P&L'} stroke={drawdown ? '#b64b48' : '#137b80'} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function WeeklyChart({ points, weekdays, today }: { points: Point[]; weekdays: number[]; today: string }) {
  const data = useMemo(() => getWeeklyPnl(points, weekdays, today), [points, weekdays, today])

  if (data.every((item) => item.pnl === null)) return <div className="flex h-64 items-center justify-center text-sm text-[#75827a]">No results in the last four weeks.</div>

  return <div className="h-64 w-full" role="img" aria-label="Total profit and loss for this week and the previous three weeks">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 20, bottom: 8, left: 16 }}>
        <CartesianGrid stroke="#e7ece9" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#6f7d81', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(value: number) => formatMoney(value)} width={82} tick={{ fill: '#6f7d81', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(_, payload) => payload[0]?.payload?.range ?? ''} contentStyle={{ border: '1px solid #dce3e1', borderRadius: 12, boxShadow: '0 8px 24px rgba(21, 38, 43, .12)' }} />
        <ReferenceLine y={0} stroke="#8b9697" />
        <Bar dataKey="pnl" name="Weekly P&L" radius={[4, 4, 0, 0]} isAnimationActive>
          {data.map((item) => <Cell key={item.week} fill={(item.pnl ?? 0) < 0 ? '#b64b48' : '#137b80'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}

function LoadingState() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f1f3f0] p-5 lg:grid lg:grid-cols-[clamp(17rem,20vw,20rem)_1fr] lg:gap-5">
      <div className="hidden rounded-3xl bg-[#14212a] lg:block" />
      <main className="space-y-4">
        <div className="h-14 w-80 rounded-xl bg-[#e0e6e3]" />
        <div className="h-14 rounded-xl bg-white" />
        <div className="h-96 rounded-2xl bg-white" />
      </main>
    </div>
  )
}

export default function PublicTracker() {
  const [data, setData] = useState<TrackerData | null>(null)
  const [selectedRange, setSelectedRange] = useState<DateRange>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<number | 'all' | null>(null)
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const [weekdayFilterOpen, setWeekdayFilterOpen] = useState(false)
  const [lotMultipliers, setLotMultipliers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    trackerApi.load()
      .then((result) => {
        setData(result)
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load tracker data'))
      .finally(() => setLoading(false))
  }, [])

  const activeStrategies = useMemo(() => (data?.strategies ?? []).filter((strategy) => strategy.active), [data])
  const strategies = useMemo(() => activeStrategies.filter((strategy) =>
    selectedWeekdays.length === 0 || (strategy.weekdays ?? []).some((weekday) => selectedWeekdays.includes(weekday))
  ), [activeStrategies, selectedWeekdays])
  const weekdayFilterSummary = selectedWeekdays.length === 0 ? 'All days'
    : selectedWeekdays.length === weekdayPreset.length && weekdayPreset.every((weekday) => selectedWeekdays.includes(weekday)) ? 'Weekdays'
      : selectedWeekdays.length === trackerWeekdays.length ? 'Every day'
        : trackerWeekdays.filter((weekday) => selectedWeekdays.includes(weekday.value)).map((weekday) => weekday.short).join(' · ')
  const strategyIds = useMemo(() => new Set(strategies.map((strategy) => strategy.id)), [strategies])
  const activeEntries = useMemo(() => (data?.entries ?? []).filter((entry) => strategyIds.has(entry.strategyId)), [data, strategyIds])
  useEffect(() => {
    if (typeof selectedStrategy === 'number' && !strategies.some((strategy) => strategy.id === selectedStrategy)) setSelectedStrategy(null)
  }, [selectedStrategy, strategies])
  const selectedStrategies = typeof selectedStrategy === 'number'
    ? strategies.filter((strategy) => strategy.id === selectedStrategy)
    : strategies
  const cardStrategies = selectedStrategy === null ? [] : selectedStrategies
  const selectedIds = useMemo(() => new Set(selectedStrategies.map((strategy) => strategy.id)), [selectedStrategies])
  const allEntries = useMemo(() => activeEntries
    .map((entry) => ({ ...entry, pnl: entry.pnl * (lotMultipliers[entry.strategyId] ?? 1) })),
  [activeEntries, lotMultipliers])
  const rangeStart = selectedRange?.from ? formatDate(selectedRange.from, 'yyyy-MM-dd') : ''
  const rangeEnd = selectedRange?.to ? formatDate(selectedRange.to, 'yyyy-MM-dd') : ''
  const allReportEntries = useMemo(() => allEntries.filter((entry) =>
    (!rangeStart || entry.tradeDate >= rangeStart) && (!rangeEnd || entry.tradeDate <= rangeEnd)
  ), [allEntries, rangeStart, rangeEnd])
  const reportEntries = useMemo(() => allReportEntries.filter((entry) => selectedIds.has(entry.strategyId)), [allReportEntries, selectedIds])

  const weekly = useMemo(() => {
    const totals = new Map<string, number>()
    reportEntries.forEach((entry) => totals.set(entry.tradeDate, (totals.get(entry.tradeDate) ?? 0) + entry.pnl))
    return [...totals].map(([date, pnl]) => ({ date, pnl })).sort((a, b) => a.date.localeCompare(b.date))
  }, [reportEntries])
  const weeklyPoints = useMemo(() => allReportEntries.filter((entry) => selectedIds.has(entry.strategyId))
    .map((entry) => ({ date: entry.tradeDate, pnl: entry.pnl })), [allReportEntries, selectedIds])
  const history = useMemo(() => {
    let balance = 0
    let peak = 0
    return weekly.map((point) => {
      balance += point.pnl
      peak = Math.max(peak, balance)
      return { ...point, drawdown: balance - peak }
    }).reverse()
  }, [weekly])
  const totalCapital = selectedStrategies.reduce((total, strategy) => total + strategy.capital * (lotMultipliers[strategy.id] ?? 1), 0)
  const totalPnl = reportEntries.reduce((total, entry) => total + entry.pnl, 0)
  const currentDate = allReportEntries.reduce((latest, entry) => entry.tradeDate > latest ? entry.tradeDate : latest, '') || rangeEnd || rangeStart || getCurrentTradingDate()
  const reportWeekday = new Date(`${currentDate}T00:00:00Z`).getUTCDay()
  const selectedMonth = currentDate.slice(0, 7)
  const sortedBreakdownStrategies = useMemo(() => {
    const weeklyPnlByStrategy = new Map<number, number>()
    allReportEntries.forEach((entry) => {
      if (entry.tradeDate === currentDate) weeklyPnlByStrategy.set(entry.strategyId, (weeklyPnlByStrategy.get(entry.strategyId) ?? 0) + entry.pnl)
    })
    return [...strategies].sort((a, b) => (weeklyPnlByStrategy.get(b.id) ?? 0) - (weeklyPnlByStrategy.get(a.id) ?? 0))
  }, [allReportEntries, strategies, currentDate])
  const breakdownCapital = strategies.reduce((total, strategy) => total + strategy.capital * (lotMultipliers[strategy.id] ?? 1), 0)
  const breakdownWeeklyPnl = allReportEntries.filter((entry) => entry.tradeDate === currentDate).reduce((total, entry) => total + entry.pnl, 0)
  const breakdownMonthlyPnl = allReportEntries.filter((entry) => entry.tradeDate.startsWith(selectedMonth)).reduce((total, entry) => total + entry.pnl, 0)
  const monthly = useMemo(() => rollup(reportEntries, (entry) => entry.tradeDate.slice(0, 7)), [reportEntries])
  const winningWeeks = weekly.filter((point) => point.pnl > 0)
  const losingWeeks = weekly.filter((point) => point.pnl < 0)
  const winPercent = weekly.length ? winningWeeks.length / weekly.length * 100 : 0
  const lossPercent = weekly.length ? losingWeeks.length / weekly.length * 100 : 0
  const averageWin = winningWeeks.length ? winningWeeks.reduce((sum, point) => sum + point.pnl, 0) / winningWeeks.length : 0
  const averageLoss = losingWeeks.length ? Math.abs(losingWeeks.reduce((sum, point) => sum + point.pnl, 0)) / losingWeeks.length : 0
  const expectancy = winPercent / 100 * averageWin - lossPercent / 100 * averageLoss
  const statistics = getTrackerStatistics(weekly)
  const rangeLabel = selectedRange?.from
    ? `${formatDate(selectedRange.from, 'MMM d, yyyy')}${selectedRange.to ? ` – ${formatDate(selectedRange.to, 'MMM d, yyyy')}` : ' – Select end date'}`
    : 'All dates'
  const reportDateLabel = currentDate
    ? formatDate(new Date(`${currentDate}T00:00:00`), 'dd MMM yyyy')
    : 'No report date'
  const storedBrand = data?.settings.title || 'DECAY HUNTERS PORTFOLIO — Weekly P&L Tracker'
  const brand = /Weekly P&L Tracker$/i.test(storedBrand) ? storedBrand : storedBrand.replace(/P&L Tracker$/i, 'Weekly P&L Tracker')
  const logoUrl = data?.settings.logoUrl

  if (loading) return <LoadingState />

  return (
    <div className={`${headingFont.variable} ${dataFont.variable} tracker-page min-h-screen bg-[#f1f3f0] text-[#19272d] selection:bg-[#cde9df] selection:text-[#10282c] lg:grid lg:grid-cols-[clamp(17rem,20vw,20rem)_minmax(0,1fr)]`}>
      <aside className="tracker-sidebar fixed inset-y-0 left-0 z-30 hidden h-dvh min-h-0 w-[clamp(17rem,20vw,20rem)] overflow-hidden bg-[#14212a] px-5 pb-5 pt-6 text-white lg:flex lg:flex-col">
        <div className="shrink-0 border-b border-white/10 pb-5">
          <Brand name={brand} logoUrl={logoUrl} />
        </div>
        <nav className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2 pr-1 scrollbar-thin">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#91a99a]">Dashboard</p>
          <button aria-pressed={selectedStrategy === 'all'} onClick={() => setSelectedStrategy('all')} className={`group mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9de0b6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14271f] ${selectedStrategy === 'all' ? 'bg-[#244b37] text-white shadow-[inset_0_0_0_1px_rgba(157,224,182,0.16)]' : 'text-[#c0cec4] hover:bg-white/[0.06] hover:text-white'}`}>
            <Layers3 size={17} className={selectedStrategy === 'all' ? 'text-[#9de0b6]' : 'text-[#7da78b]'} />
            <span className="flex-1">All strategies</span>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full bg-[#9de0b6] transition-opacity ${selectedStrategy === 'all' ? 'opacity-100' : 'opacity-0'}`} />
          </button>
          <div className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#91a99a]">Strategies</div>
          <div className="space-y-1">
            {strategies.map((strategy) => {
              const selected = selectedStrategy === strategy.id
              return <button key={strategy.id} aria-pressed={selected} onClick={() => setSelectedStrategy(selected ? null : strategy.id)} className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] leading-[1.3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9de0b6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14271f] ${selected ? 'bg-[#244b37] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(157,224,182,0.16)]' : 'text-[#c0cec4] hover:bg-white/[0.06] hover:text-white'}`}>
                <span aria-hidden="true" className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${selected ? 'bg-[#9de0b6]' : 'bg-[#537060] group-hover:bg-[#9de0b6]'}`} />
                <span className="min-w-0 flex-1 break-words">{strategy.name}</span>
              </button>
            })}
            {!strategies.length && <p className="px-3 py-2 text-sm text-[#91a99a]">{activeStrategies.length ? 'No strategies scheduled for the selected weekdays' : 'No active strategies yet'}</p>}
          </div>
        </nav>
        <div className="mt-3 shrink-0 border-t border-white/10 pt-4">
          <p className="flex items-start gap-2.5 px-3 text-[11px] leading-5 text-[#a9beae]">
            <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#74c693]" />
            Weekly results, updated each Friday.
          </p>
        </div>
      </aside>

      <main className="mx-auto min-w-0 w-full max-w-[1720px] px-[clamp(1rem,3vw,2.5rem)] pb-6 pt-[clamp(1rem,2.5vw,2rem)] lg:col-start-2">
        <header className="tracker-header mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#d2dcda] bg-white text-[#203238] lg:hidden" aria-label={menuOpen ? 'Close strategies' : 'Open strategies'} aria-expanded={menuOpen} aria-controls="mobile-strategy-menu" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="lg:hidden"><Brand name={brand} logoUrl={logoUrl} /></div>
            <div className="hidden lg:block">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{brand}</h1>
              <p className="mt-1 text-sm text-[#75827a]">{dateRange(history)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button type="button" aria-label={`Select date range: ${rangeLabel}. Report date: ${reportDateLabel}`} className="flex items-center gap-3 rounded-xl border border-[#3c4f76] bg-[#203258] px-3 py-2 text-left shadow-sm transition hover:bg-[#1b2d50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63a17e] focus-visible:ring-offset-2">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#9de0b6]"><CalendarDays size={16} /></span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap font-mono text-sm font-bold tracking-[0.04em] text-[#24383d]">{reportDateLabel}</span>
                    <span className="block max-w-[50vw] truncate text-[10px] font-medium text-[#617176]">{rangeLabel}</span>
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="max-h-[calc(100dvh-1rem)] w-auto overflow-y-auto p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={selectedRange?.from ?? (currentDate ? new Date(`${currentDate}T00:00:00`) : undefined)}
                  selected={selectedRange}
                  onSelect={(range) => {
                    setSelectedRange(range)
                    if (range?.from && range.to) setCalendarOpen(false)
                  }}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t border-[#e1e8df] px-4 py-2 text-xs text-[#75827a]">
                  <span>Choose a start and end date</span>
                  <button type="button" className="font-semibold text-[#1c7c55] hover:underline" onClick={() => { setSelectedRange(undefined); setCalendarOpen(false) }}>Clear</button>
                </div>
              </PopoverContent>
            </Popover>
            <span role="status" aria-label="EOW Report" className="inline-flex items-center gap-2 rounded-full border border-[#cce7d5] bg-[#e9f5ed] px-3 py-2 text-xs font-bold text-[#176b49]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#21875d]" />
              EOW Report
            </span>
            {data?.settings.contactUrl && <a className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#1c7c55] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#176b49]" href={data.settings.contactUrl} target="_blank" rel="noreferrer">Contact <ArrowUpRight size={15} /></a>}
          </div>
        </header>

        <div id="mobile-strategy-menu" className={`${menuOpen ? 'grid' : 'hidden'} mb-4 gap-2 rounded-2xl border border-[#d2dcda] bg-white p-3 shadow-[0_12px_30px_rgba(20,33,42,0.09)] lg:hidden`}>
          <button onClick={() => { setSelectedStrategy('all'); setMenuOpen(false) }} className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm font-bold ${selectedStrategy === 'all' ? 'bg-[#edf4ed]' : 'hover:bg-[#f4f6f1]'}`}>All strategies</button>
          {strategies.map((strategy) => <button key={strategy.id} aria-pressed={selectedStrategy === strategy.id} onClick={() => { setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id); setMenuOpen(false) }} className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm ${selectedStrategy === strategy.id ? 'bg-[#edf4ed] font-bold' : 'hover:bg-[#f4f6f1]'}`}>{strategy.name}</button>)}
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-[#efc0b8] bg-[#fff2ef] p-4 text-sm text-[#a33c31]">Tracker data could not be loaded: {error}</div>}

        {!activeStrategies.length ? (
          <section className={`${panel} mt-12 py-16 text-center`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1c7c55]">Performance report</p>
            <h2 className="mt-3 text-2xl font-black">The tracker is being set up</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75827a]">Strategy and weekly P&amp;L updates will appear here after each Friday close.</p>
          </section>
        ) : (
          <>
            {typeof selectedStrategy === 'number' && selectedStrategies[0] && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce3e1] bg-white px-5 py-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Strategy view</p><h2 className="mt-1 text-lg font-bold">{selectedStrategies[0].name}</h2></div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedWeekdays.length > 0 && <div className="flex min-h-11 items-center gap-2 rounded-xl border border-[#8fc4e5] bg-[#eff7fd] px-3 text-xs font-semibold text-[#176b9b]">
                  <span>Weekday filter: {trackerWeekdays.filter(({ value }) => selectedWeekdays.includes(value)).map(({ name }) => name).join(', ')}</span>
                  <button type="button" aria-label="Clear weekday filter" onClick={() => setSelectedWeekdays([])} className="rounded px-1 py-2 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6f9e]">Clear</button>
                </div>}
                <button type="button" onClick={() => setSelectedStrategy(null)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#244b37] px-4 text-sm font-semibold text-white hover:bg-[#1c3f2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7c55] focus-visible:ring-offset-2"><Layers3 size={16} />Back to overview</button>
              </div>
            </div>}
            {cardStrategies.length > 0 && <section className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
              {cardStrategies.map((strategy) => {
                const rows = reportEntries.filter((entry) => entry.strategyId === strategy.id)
                const lot = lotMultipliers[strategy.id] ?? 1
                const capital = strategy.capital * lot
                const pnl = rows.reduce((total, entry) => total + entry.pnl, 0)
                const winRate = rows.length ? rows.filter((entry) => entry.pnl > 0).length / rows.length * 100 : 0
                return <article key={strategy.id} className="rounded-2xl border border-[#e1e8df] bg-white p-5 shadow-[0_8px_24px_rgba(16,40,30,0.045)]">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">{strategy.segment}</p><h2 className="mt-1 text-lg font-black">{strategy.name}</h2></div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${pnl < 0 ? 'bg-[#fff0ed] text-[#bf4d40]' : 'bg-[#e9f5ed] text-[#19734f]'}`}>{formatPercent(capital ? pnl / capital * 100 : 0)} ROI</span>
                  </div>
                  {strategy.description && <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-[#1c7c55]">Strategy description</summary>
                    <p className="mt-2 text-xs leading-5 text-[#75827a]">{strategy.description}</p>
                  </details>}
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#edf1eb] pt-4 text-sm">
                    <Metric label="Capital" value={formatMoney(capital)} />
                    <Metric label="Total P&L" value={formatMoney(pnl)} valueClass={positive(pnl)} />
                    <Metric label="Reporting weeks" value={String(rows.length)} />
                    <Metric label="Win rate" value={formatPercent(winRate)} />
                    <label className="grid content-start gap-1.5 text-[11px] text-[#75827a]">
                      <span>Lot</span>
                      <select aria-label={`${strategy.name} lot size`} value={String(lot)} onChange={(event) => setLotMultipliers((current) => ({ ...current, [strategy.id]: Number(event.target.value) }))} className="min-h-11 rounded-lg border border-[#d9e3d9] bg-white px-3 text-sm font-semibold text-[#173126]">
                        {lotOptions.map((option) => <option key={option} value={option}>{option}x</option>)}
                      </select>
                    </label>
                  </div>
                  {strategy.subscribeUrl && <a href={strategy.subscribeUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1c7c55] hover:underline">Strategy details <ArrowUpRight size={13} /></a>}
                </article>
              })}
            </section>}

            {typeof selectedStrategy !== 'number' && <section className={`${panel} tracker-breakdown mb-5`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="font-[var(--tracker-heading)] text-[1.45rem] font-bold tracking-[-0.02em] text-[#182c32]">Weekly breakdown <span className="font-medium text-[#75827a]">· week ending {currentDate || '—'}</span></h2></div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <p className="text-xs text-[#75827a]">Monthly figures include the selected month</p>
                  <button type="button" aria-label={`Weekday filter: ${weekdayFilterSummary}. ${weekdayFilterOpen ? 'Hide' : 'Show'} options`} aria-expanded={weekdayFilterOpen} aria-controls="weekday-filter-options" onClick={() => setWeekdayFilterOpen((open) => !open)} className={`inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6f9e] focus-visible:ring-offset-2 ${selectedWeekdays.length ? 'border-[#8fc4e5] bg-[#eff7fd] text-[#176b9b]' : 'border-[#d9e3d9] bg-white text-[#52635a] hover:bg-[#f7f9f6]'}`}>
                    <Filter size={14} />
                    <span>Weekdays</span>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium">{weekdayFilterSummary}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${weekdayFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              <div id="weekday-filter-options" aria-hidden={!weekdayFilterOpen} inert={!weekdayFilterOpen} className={`grid transition-[grid-template-rows,opacity,margin] ease-out motion-reduce:transition-none ${weekdayFilterOpen ? 'duration-200 mt-3 grid-rows-[1fr] opacity-100' : 'duration-300 mt-0 grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0 overflow-hidden">
                  <div className="border-y border-dashed border-[#e1e8df] py-4">
                    <p className="w-full text-left text-xs font-medium text-[#75827a]">Filter by</p>
                    <div role="group" aria-label="Filter all tracker data by weekday" className="mt-2 flex w-full flex-wrap items-center justify-start gap-2">
                      <button type="button" aria-label="Clear weekday filters" disabled={!selectedWeekdays.length} onClick={() => setSelectedWeekdays([])} style={{ transitionDelay: weekdayFilterOpen ? '0ms' : `${(trackerWeekdays.length + 1) * 18}ms` }} className={`group inline-flex size-8 items-center justify-center rounded-full border border-[#d8e0e5] text-[#75827a] transition-[opacity,transform,background-color,border-color,color,box-shadow] duration-150 ease-out hover:bg-[#f4f6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6f9e] disabled:cursor-default disabled:hover:bg-transparent motion-reduce:transition-none motion-reduce:transform-none ${weekdayFilterOpen ? `tracker-weekday-enter translate-y-0 scale-100 ${selectedWeekdays.length ? 'opacity-100' : 'opacity-50'}` : '-translate-y-1 scale-90 opacity-0'}`}><X size={15} className="transition-transform duration-200 ease-out motion-safe:group-hover:rotate-90 motion-safe:group-active:-rotate-90 motion-reduce:transition-none" /></button>
                      <button type="button" aria-pressed={selectedWeekdays.length === weekdayPreset.length && weekdayPreset.every((weekday) => selectedWeekdays.includes(weekday))} onClick={() => setSelectedWeekdays((current) => weekdayPreset.every((weekday) => current.includes(weekday)) && current.length === weekdayPreset.length ? [] : weekdayPreset)} style={{ animationDelay: weekdayFilterOpen ? '18ms' : '0ms', transitionDelay: weekdayFilterOpen ? '0ms' : `${trackerWeekdays.length * 18}ms` }} className={`min-h-8 rounded-full border px-3 text-xs font-medium transition-[opacity,transform,background-color,border-color,color,box-shadow] duration-150 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6f9e] motion-reduce:transition-none motion-reduce:transform-none ${weekdayFilterOpen ? 'tracker-weekday-enter translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-95 opacity-0'} ${selectedWeekdays.length === weekdayPreset.length && weekdayPreset.every((weekday) => selectedWeekdays.includes(weekday)) ? 'border-[#1b6f9e] bg-[#1b6f9e] text-white' : 'border-[#8fc4e5] bg-[#eff7fd] text-[#176b9b] hover:bg-[#e2f1fb]'}`}>Weekdays</button>
                      {trackerWeekdays.map((weekday, index) => {
                        const selected = selectedWeekdays.includes(weekday.value)
                        return <button key={weekday.value} type="button" aria-label={weekday.name} aria-pressed={selected} onClick={() => setSelectedWeekdays((current) => current.includes(weekday.value) ? current.filter((value) => value !== weekday.value) : [...current, weekday.value].sort((a, b) => a - b))} style={{ animationDelay: weekdayFilterOpen ? `${36 + index * 18}ms` : '0ms', transitionDelay: weekdayFilterOpen ? '0ms' : `${(trackerWeekdays.length - 1 - index) * 18}ms` }} className={`inline-flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-[opacity,transform,background-color,border-color,color,box-shadow] duration-150 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b6f9e] motion-reduce:transition-none motion-reduce:transform-none ${weekdayFilterOpen ? 'tracker-weekday-enter translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-90 opacity-0'} ${selected ? 'border-[#1b6f9e] bg-[#1b6f9e] text-white' : 'border-[#8fc4e5] bg-[#eff7fd] text-[#176b9b] hover:bg-[#e2f1fb]'}`}>{weekday.short}</button>
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="tracker-breakdown-table mt-4 hidden overflow-x-auto overscroll-x-contain xl:block">
                <table className="w-full min-w-max table-fixed text-left text-sm">
                  <colgroup><col className="w-[40%]" /><col className="w-[15%]" /><col className="w-[15%]" /><col className="w-[15%]" /><col className="w-[15%]" /></colgroup>
                  <thead className="text-[11px] uppercase tracking-wide text-[#75827a]"><tr><th className="px-3 pb-3 font-semibold">Strategy / schedule</th><th className="px-3 pb-3 text-right font-semibold">Capital</th><th className="px-3 pb-3 text-center font-semibold">Lot</th><th className="px-3 pb-3 text-right font-semibold" title="Strategies sorted by weekly profit, highest first">Weekly P&amp;L ↓</th><th className="px-3 pb-3 text-right font-semibold">Monthly P&amp;L</th></tr></thead>
                  <tbody>{sortedBreakdownStrategies.length ? sortedBreakdownStrategies.map((strategy) => {
                    const day = allReportEntries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate === currentDate).reduce((sum, entry) => sum + entry.pnl, 0)
                    const month = allReportEntries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate.startsWith(selectedMonth)).reduce((sum, entry) => sum + entry.pnl, 0)
                    const scheduledDays = trackerWeekdays.filter((weekday) => (strategy.weekdays ?? []).includes(weekday.value))
                    return <tr key={strategy.id} className="border-t border-[#edf1eb]"><td className="px-3 py-3"><p className="font-semibold">{strategy.name}</p>{scheduledDays.length ? <div className="mt-1.5 flex flex-wrap gap-1" aria-label={`Trading schedule for ${strategy.name}`}>
                      {scheduledDays.map((weekday) => <abbr key={weekday.value} title={weekday.value === reportWeekday ? `${weekday.name} · report date` : weekday.name} className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-bold no-underline ${weekday.value === reportWeekday ? 'bg-[#1c7c55] text-white' : 'bg-[#e9f5ed] text-[#176b49]'}`}>{weekday.short}</abbr>)}
                    </div> : <p className="mt-1 text-[11px] font-normal text-[#75827a]">Schedule not set</p>}</td><td className="px-3 py-4 text-right tabular-nums">{formatMoney(strategy.capital * (lotMultipliers[strategy.id] ?? 1))}</td><td className="px-3 py-3 text-center"><select aria-label={`${strategy.name} lot size in weekly breakdown`} value={String(lotMultipliers[strategy.id] ?? 1)} onChange={(event) => setLotMultipliers((current) => ({ ...current, [strategy.id]: Number(event.target.value) }))} className="min-h-11 rounded-lg border border-[#d9e3d9] bg-white px-3 text-sm font-semibold text-[#173126]">{lotOptions.map((option) => <option key={option} value={option}>{option}x</option>)}</select></td><td className={`px-3 py-4 text-right font-bold tabular-nums ${positive(day)}`}>{formatMoney(day)}</td><td className={`px-3 py-4 text-right font-semibold tabular-nums ${positive(month)}`}>{formatMoney(month)}</td></tr>
                  }) : <tr><td colSpan={5} className="border-t border-[#edf1eb] px-3 py-8 text-center text-sm text-[#75827a]">No strategies scheduled for the selected day{selectedWeekdays.length > 1 ? 's' : ''}.</td></tr>}</tbody>
                  <tfoot><tr className="border-t-2 border-[#dfe8dd]"><td className="px-3 pt-4 font-black">Total</td><td className="px-3 pt-4 text-right font-bold tabular-nums">{formatMoney(breakdownCapital)}</td><td className="px-3 pt-4" aria-hidden="true"></td><td className={`px-3 pt-4 text-right font-bold tabular-nums ${positive(breakdownWeeklyPnl)}`}>{formatMoney(breakdownWeeklyPnl)}</td><td className={`px-3 pt-4 text-right font-bold tabular-nums ${positive(breakdownMonthlyPnl)}`}>{formatMoney(breakdownMonthlyPnl)}</td></tr></tfoot>
                </table>
              </div>
              <div className="mt-4 grid gap-3 xl:hidden">
                {sortedBreakdownStrategies.length ? sortedBreakdownStrategies.map((strategy) => {
                  const day = allReportEntries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate === currentDate).reduce((sum, entry) => sum + entry.pnl, 0)
                  const month = allReportEntries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate.startsWith(selectedMonth)).reduce((sum, entry) => sum + entry.pnl, 0)
                  const scheduledDays = trackerWeekdays.filter((weekday) => (strategy.weekdays ?? []).includes(weekday.value))
                  return <article key={strategy.id} className="tracker-breakdown-row rounded-2xl border border-[#e1e8e5] bg-[#fbfcfb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><h3 className="font-semibold leading-snug">{strategy.name}</h3>{scheduledDays.length ? <div className="mt-2 flex flex-wrap gap-1" aria-label={`Trading schedule for ${strategy.name}`}>
                        {scheduledDays.map((weekday) => <abbr key={weekday.value} title={weekday.value === reportWeekday ? `${weekday.name} (report date)` : weekday.name} className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold no-underline ${weekday.value === reportWeekday ? 'bg-[#137b80] text-white' : 'bg-[#e9f2ef] text-[#386c68]'}`}>{weekday.short}</abbr>)}
                      </div> : <p className="mt-1 text-[11px] text-[#6f7d81]">Schedule not set</p>}</div>
                      <label className="grid shrink-0 gap-1 text-[10px] font-medium text-[#68797d]">Lot<select aria-label={`${strategy.name} lot size in weekly breakdown`} value={String(lotMultipliers[strategy.id] ?? 1)} onChange={(event) => setLotMultipliers((current) => ({ ...current, [strategy.id]: Number(event.target.value) }))} className="min-h-9 rounded-lg border border-[#ccd7d5] bg-white px-2.5 text-xs font-semibold text-[#19272d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#137b80]">{lotOptions.map((option) => <option key={option} value={option}>{option}x</option>)}</select></label>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#e5ebe8] pt-3">
                      <Metric label="Capital" value={formatMoney(strategy.capital * (lotMultipliers[strategy.id] ?? 1))} />
                      <Metric label="Weekly P&L" value={formatMoney(day)} valueClass={positive(day)} />
                      <Metric label="Monthly P&L" value={formatMoney(month)} valueClass={positive(month)} />
                    </div>
                  </article>
                }) : <div className="rounded-xl border border-dashed border-[#d2dcda] px-4 py-9 text-center text-sm text-[#617176]">No strategies scheduled for the selected day{selectedWeekdays.length > 1 ? 's' : ''}.</div>}
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-[#eef3f0] px-4 py-3">
                  <Metric label="Total capital" value={formatMoney(breakdownCapital)} />
                  <Metric label="Weekly total" value={formatMoney(breakdownWeeklyPnl)} valueClass={positive(breakdownWeeklyPnl)} />
                  <Metric label="Monthly total" value={formatMoney(breakdownMonthlyPnl)} valueClass={positive(breakdownMonthlyPnl)} />
                </div>
              </div>
            </section>}

            <section className={`${panel} mb-5`}><ChartTitle title="Cumulative P&L" detail="Combined reported weekly results" /><Chart points={weekly} /></section>

            <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,27rem),1fr))] gap-4">
              <article className={panel}><ChartTitle title="Last 30 reporting weeks" detail="Weekly P&L" /><Chart points={weekly.slice(-30)} /></article>
              <article className={panel}><ChartTitle title="Drawdown" detail="Distance from the cumulative peak" /><Chart points={history.slice().reverse()} drawdown /></article>
              <article className={panel}><ChartTitle title="P&L by week" detail="Selected week and previous three · weekday filter applies" /><WeeklyChart points={weeklyPoints} weekdays={selectedWeekdays} today={currentDate} /></article>
            </section>

            <section className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,27rem),1fr))] gap-4">
              <article className={panel}>
                <ChartTitle title="Weekly P&L history" detail="Results by reporting week" />
                <div className="mt-4 max-h-[390px] overflow-auto overscroll-x-contain">
                  <table className="w-full min-w-max text-sm"><thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wide text-[#75827a]"><tr><th className="pb-2 text-left font-semibold">Week ending</th><th className="pb-2 text-right font-semibold">Weekly P&amp;L</th><th className="pb-2 text-right font-semibold">Weekly ROI</th><th className="pb-2 text-right font-semibold">Drawdown</th></tr></thead><tbody>{history.map((point) => <tr key={point.date} className="border-t border-[#edf1eb]"><td className="py-2.5">{point.date}</td><td className={`py-2.5 text-right font-semibold tabular-nums ${positive(point.pnl)}`}>{formatMoney(point.pnl)}</td><td className="py-2.5 text-right tabular-nums">{formatPercent(totalCapital ? point.pnl / totalCapital * 100 : 0)}</td><td className={`py-2.5 text-right tabular-nums ${positive(point.drawdown ?? 0)}`}>{formatMoney(point.drawdown ?? 0)}</td></tr>)}</tbody></table>
                </div>
              </article>
              <article className={panel}>
                <ChartTitle title="Performance statistics" detail="Across the selected strategies and date range" />
                <div className="tracker-stats mt-3 grid grid-cols-1 divide-y divide-[#e8edeb] sm:grid-cols-2 sm:divide-y-0 sm:gap-x-7">
                  <Stat label="Reporting weeks" value={String(weekly.length)} />
                  <Stat label="Winning weeks" value={String(winningWeeks.length)} icon={<TrendingUp size={15} className="text-[#18805a]" />} />
                  <Stat label="Win %" value={formatPercent(winPercent)} />
                  <Stat label="Losing weeks" value={String(losingWeeks.length)} icon={<TrendingDown size={15} className="text-[#c74f42]" />} />
                  <Stat label="Loss %" value={formatPercent(lossPercent)} />
                  <Stat label="Average weekly P&L" value={formatMoney(expectancy)} valueClass={positive(expectancy)} />
                  <Stat label="Net P&L" value={formatMoney(totalPnl)} valueClass={positive(totalPnl)} />
                  <Stat label="Total ROI" value={formatPercent(totalCapital ? totalPnl / totalCapital * 100 : 0)} />
                  <Stat label="Best week" value={formatMoney(Math.max(0, ...weekly.map((point) => point.pnl)))} valueClass="text-[#18805a]" />
                  <Stat label="Worst week" value={formatMoney(Math.min(0, ...weekly.map((point) => point.pnl)))} valueClass="text-[#c74f42]" />
                  <Stat label="Gross profit" value={formatMoney(statistics.grossProfit)} valueClass="text-[#18805a]" />
                  <Stat label="Gross loss" value={formatMoney(-statistics.grossLoss)} valueClass="text-[#c74f42]" />
                  <Stat label="Average winning week" value={winningWeeks.length ? formatMoney(averageWin) : '—'} valueClass="text-[#18805a]" />
                  <Stat label="Average losing week" value={losingWeeks.length ? formatMoney(-averageLoss) : '—'} valueClass="text-[#c74f42]" />
                  <Stat label="Profit factor" value={statistics.grossLoss ? `${(statistics.grossProfit / statistics.grossLoss).toFixed(2)}×` : '—'} />
                  <Stat label="Payoff ratio" value={winningWeeks.length && averageLoss ? `${(averageWin / averageLoss).toFixed(2)}×` : '—'} />
                  <Stat label="Maximum drawdown" value={formatMoney(-statistics.maxDrawdown)} valueClass="text-[#c74f42]" />
                  <Stat label="Breakeven weeks" value={String(weekly.length - winningWeeks.length - losingWeeks.length)} />
                  <Stat label="Longest winning streak" value={`${statistics.longestWinningStreak} weeks`} />
                  <Stat label="Longest losing streak" value={`${statistics.longestLosingStreak} weeks`} />
                </div>
                <p className="mt-3 text-xs text-[#617176]">Profit factor = gross profit ÷ gross loss. Payoff ratio = average win ÷ average loss. — means insufficient results. Breakeven weeks reset streaks.</p>
              </article>
            </section>

            <section className="mb-4">
              <Rollup title="Monthly summary" rows={monthly} capital={totalCapital} />
            </section>
            {data?.settings.contactUrl && <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cce7d5] bg-[#e9f5ed] px-4 py-3">
              <div>
                <p className="text-sm font-bold">Customize your portfolio</p>
                <p className="mt-0.5 text-xs text-[#52645a]">Contact our team to discuss your needs.</p>
                <p className="mt-2 text-xs font-medium text-[#176b49]">Daily live P&amp;L will be uploaded in my Telegram channel.</p>
              </div>
              <div className="grid justify-items-start gap-2 sm:justify-items-end">
                <a className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-[#1c7c55] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#176b49]" href={data.settings.contactUrl} target="_blank" rel="noreferrer">Contact <ArrowUpRight size={14} aria-hidden="true" /></a>
                <a className="inline-flex items-center gap-1 text-xs font-semibold text-[#176b49] underline underline-offset-2 hover:text-[#12563a]" href={data.settings.contactUrl} target="_blank" rel="noreferrer">Telegram channel <ArrowUpRight size={13} aria-hidden="true" /></a>
              </div>
            </section>}
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe7dd] py-5 text-xs text-[#75827a]">
          <span className="inline-flex items-center gap-1.5"><CircleHelp size={14} /> P&amp;L values are reported in Indian rupees.</span>
          <span>Weekly Data Updated Every Friday Evening</span>
        </footer>
      </main>
    </div>
  )
}

function Brand({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const shortName = name.split(/[—–-]/)[0].trim() || 'DECAY HUNTERS'
  const initials = shortName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <Link href="/" aria-label="Decay Hunters home" className="flex min-w-0 items-center gap-3">
    {logoUrl ? <img src={logoUrl} alt={`${shortName} logo`} className="h-10 w-10 shrink-0 rounded-xl object-contain" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d3e5d8] text-sm font-black tracking-tight text-[#1c704d]">{initials}</div>}
    <div className="min-w-0"><p className="break-words text-sm font-black leading-4 tracking-wide">{shortName}</p><p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f987d]">P&amp;L Tracker</p></div>
  </Link>
}

function Metric({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return <div><p className="text-[11px] font-medium text-[#68797d]">{label}</p><p className={`mt-1 font-semibold tabular-nums ${valueClass}`}>{value}</p></div>
}

function ChartTitle({ title, detail }: { title: string; detail: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-[var(--tracker-heading)] text-lg font-bold tracking-[-0.02em] text-[#1d3238]">{title}</h2><p className="mt-1 text-xs text-[#617176]">{detail}</p></div></div>
}

function Stat({ label, value, valueClass = '', icon }: { label: string; value: string; valueClass?: string; icon?: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-[#e8edeb] py-3 text-sm"><span className="inline-flex items-center gap-2 text-[#506469]">{icon}{label}</span><b className={`tabular-nums ${valueClass}`}>{value}</b></div>
}

function Rollup({ title, rows, capital }: { title: string; rows: [string, number][]; capital: number }) {
  return <article className={panel}>
    <ChartTitle title={title} detail="Aggregated weekly results" />
    <div className="mt-4 max-h-[330px] overflow-auto overscroll-x-contain"><table className="w-full min-w-max text-sm"><tbody>{rows.map(([period, pnl]) => <tr key={period} className="border-t border-[#edf1eb]"><td className="py-2.5 font-medium">{period}<span className="ml-2 text-xs font-normal text-[#75827a]">{new Date(`${period}-01T00:00:00Z`).toLocaleString(undefined, { month: 'long', timeZone: 'UTC' })}</span></td><td className={`py-2.5 text-right font-semibold tabular-nums ${positive(pnl)}`}>{formatMoney(pnl)}</td><td className="py-2.5 text-right text-xs text-[#75827a]">{formatPercent(capital ? pnl / capital * 100 : 0)}</td></tr>)}</tbody></table></div>
    {!rows.length && <p className="mt-4 text-sm text-[#75827a]">No P&amp;L data yet.</p>}
  </article>
}

function dateRange(history: Point[]) {
  if (!history.length) return 'No reporting weeks yet'
  return `${history[history.length - 1].date} — ${history[0].date}`
}

function rollup(entries: TrackerEntry[], getKey: (entry: TrackerEntry) => string): [string, number][] {
  const totals = new Map<string, number>()
  entries.forEach((entry) => totals.set(getKey(entry), (totals.get(getKey(entry)) ?? 0) + entry.pnl))
  return [...totals].sort(([a], [b]) => b.localeCompare(a))
}
