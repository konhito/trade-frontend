'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  CircleHelp,
  Layers3,
  Menu,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, formatPercent, trackerApi, type TrackerData, type TrackerEntry } from '@/lib/public-tracker'

type Point = { date: string; pnl: number; drawdown?: number }

const panel = 'rounded-2xl border border-[#e1e8df] bg-white p-5 shadow-[0_8px_24px_rgba(16,40,30,0.045)]'
const positive = (value: number) => value < 0 ? 'text-[#c74f42]' : 'text-[#18805a]'

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
          <CartesianGrid stroke="#e8eee7" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(date: string) => date.slice(0, 7)} minTickGap={38} tick={{ fill: '#75827a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value: number) => formatMoney(value)} width={82} tick={{ fill: '#75827a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(date) => `Date: ${date}`} />
          <Line type="monotone" dataKey="value" name={drawdown ? 'Drawdown' : 'Cumulative P&L'} stroke={drawdown ? '#d85745' : '#27865f'} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4f6f1] p-5 md:grid md:grid-cols-[250px_1fr] md:gap-5">
      <div className="hidden rounded-3xl bg-[#14271f] md:block" />
      <main className="space-y-4">
        <div className="h-12 w-80 rounded-xl bg-[#e1e8df]" />
        <div className="grid gap-4 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-36 rounded-2xl bg-white" />)}</div>
        <div className="h-72 rounded-2xl bg-white" />
      </main>
    </div>
  )
}

export default function PublicTracker() {
  const [data, setData] = useState<TrackerData | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    trackerApi.load()
      .then((result) => {
        setData(result)
        const latest = result.entries.map((entry) => entry.tradeDate).sort().at(-1)
        if (latest) setSelectedDate(latest)
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load tracker data'))
      .finally(() => setLoading(false))
  }, [])

  const strategies = useMemo(() => (data?.strategies ?? []).filter((strategy) => strategy.active), [data])
  const strategyIds = useMemo(() => new Set(strategies.map((strategy) => strategy.id)), [strategies])
  const activeEntries = useMemo(() => (data?.entries ?? []).filter((entry) => strategyIds.has(entry.strategyId)), [data, strategyIds])
  const visibleStrategies = selectedStrategy === null ? strategies : strategies.filter((strategy) => strategy.id === selectedStrategy)
  const visibleIds = useMemo(() => new Set(visibleStrategies.map((strategy) => strategy.id)), [visibleStrategies])
  const entries = useMemo(() => activeEntries.filter((entry) => visibleIds.has(entry.strategyId)), [activeEntries, visibleIds])

  const daily = useMemo(() => {
    const totals = new Map<string, number>()
    entries.forEach((entry) => totals.set(entry.tradeDate, (totals.get(entry.tradeDate) ?? 0) + entry.pnl))
    return [...totals].map(([date, pnl]) => ({ date, pnl })).sort((a, b) => a.date.localeCompare(b.date))
  }, [entries])
  const history = useMemo(() => {
    let balance = 0
    let peak = 0
    return daily.map((point) => {
      balance += point.pnl
      peak = Math.max(peak, balance)
      return { ...point, drawdown: balance - peak }
    }).reverse()
  }, [daily])
  const totalCapital = visibleStrategies.reduce((total, strategy) => total + strategy.capital, 0)
  const totalPnl = entries.reduce((total, entry) => total + entry.pnl, 0)
  const currentDate = selectedDate || history[0]?.date || ''
  const selectedMonth = currentDate.slice(0, 7)
  const monthly = useMemo(() => rollup(entries, (entry) => entry.tradeDate.slice(0, 7)), [entries])
  const yearly = useMemo(() => rollup(entries, (entry) => entry.tradeDate.slice(0, 4)), [entries])
  const brand = data?.settings.title || 'DECAY HUNTERS — P&L Tracker'
  const logoUrl = data?.settings.logoUrl

  if (loading) return <LoadingState />

  return (
    <div className="min-h-screen bg-[#f4f6f1] text-[#173126] md:grid md:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen bg-[#14271f] p-5 text-white md:flex md:flex-col">
        <Brand name={brand} logoUrl={logoUrl} />
        <div className="mb-3 mt-11 text-[10px] font-bold uppercase tracking-[0.2em] text-[#91a99a]">Dashboard</div>
        <button onClick={() => setSelectedStrategy(null)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${selectedStrategy === null ? 'bg-[#274336] text-white' : 'text-[#c0cec4] hover:bg-[#1b3428]'}`}>
          <Layers3 size={17} /> All strategies
        </button>
        <div className="mb-3 mt-9 text-[10px] font-bold uppercase tracking-[0.2em] text-[#91a99a]">Strategies</div>
        <nav className="space-y-1">
          {strategies.map((strategy) => (
            <button key={strategy.id} onClick={() => setSelectedStrategy(strategy.id)} className={`w-full truncate rounded-xl px-3 py-2.5 text-left text-sm transition ${selectedStrategy === strategy.id ? 'bg-[#274336] font-bold text-white' : 'text-[#c0cec4] hover:bg-[#1b3428]'}`}>
              {strategy.name}
            </button>
          ))}
          {!strategies.length && <p className="px-3 py-2 text-sm text-[#91a99a]">No active strategies yet</p>}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4 text-xs leading-5 text-[#91a99a]">Daily results, updated by the tracker team.</div>
      </aside>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-xl border border-[#d9e3d9] bg-white p-2 md:hidden" aria-label="Open strategies" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="md:hidden"><Brand name={brand} logoUrl={logoUrl} compact /></div>
            <div className="hidden md:block">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#75827a]">Public performance report</p>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{brand}</h1>
              <p className="mt-1 text-sm text-[#75827a]">{dateRange(history)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#d9e3d9] bg-white px-3 py-2 text-sm text-[#52645a]">
              <CalendarDays size={16} />
              <span className="sr-only">Selected trading date</span>
              <input aria-label="Selected trading date" type="date" value={currentDate} onChange={(event) => setSelectedDate(event.target.value)} className="max-w-[145px] bg-transparent text-sm outline-none" />
            </label>
            {data?.settings.contactUrl && <a className="hidden items-center gap-1.5 rounded-xl bg-[#1c7c55] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#176b49] sm:flex" href={data.settings.contactUrl} target="_blank" rel="noreferrer">Contact <ArrowUpRight size={15} /></a>}
          </div>
        </header>

        {menuOpen && <div className="mb-4 grid gap-2 rounded-2xl border border-[#d9e3d9] bg-white p-3 md:hidden">
          <button onClick={() => { setSelectedStrategy(null); setMenuOpen(false) }} className="rounded-lg bg-[#edf4ed] px-3 py-2 text-left text-sm font-bold">All strategies</button>
          {strategies.map((strategy) => <button key={strategy.id} onClick={() => { setSelectedStrategy(strategy.id); setMenuOpen(false) }} className="rounded-lg px-3 py-2 text-left text-sm">{strategy.name}</button>)}
        </div>}

        {error && <div role="alert" className="mb-5 rounded-xl border border-[#efc0b8] bg-[#fff2ef] p-4 text-sm text-[#a33c31]">Tracker data could not be loaded: {error}</div>}

        {!strategies.length ? (
          <section className={`${panel} mt-12 py-16 text-center`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1c7c55]">Performance report</p>
            <h2 className="mt-3 text-2xl font-black">The tracker is being set up</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75827a]">Strategy and daily P&amp;L updates will appear here as soon as they are added.</p>
          </section>
        ) : (
          <>
            <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleStrategies.map((strategy) => {
                const rows = activeEntries.filter((entry) => entry.strategyId === strategy.id)
                const pnl = rows.reduce((total, entry) => total + entry.pnl, 0)
                const winRate = rows.length ? rows.filter((entry) => entry.pnl > 0).length / rows.length * 100 : 0
                return <article key={strategy.id} className="rounded-2xl border border-[#e1e8df] bg-white p-5 shadow-[0_8px_24px_rgba(16,40,30,0.045)]">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">{strategy.segment}</p><h2 className="mt-1 text-lg font-black">{strategy.name}</h2></div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${pnl < 0 ? 'bg-[#fff0ed] text-[#bf4d40]' : 'bg-[#e9f5ed] text-[#19734f]'}`}>{formatPercent(strategy.capital ? pnl / strategy.capital * 100 : 0)} ROI</span>
                  </div>
                  {strategy.description && <p className="mt-2 text-xs leading-5 text-[#75827a]">{strategy.description}</p>}
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#edf1eb] pt-4 text-sm">
                    <Metric label="Capital" value={formatMoney(strategy.capital)} />
                    <Metric label="Total P&L" value={formatMoney(pnl)} valueClass={positive(pnl)} />
                    <Metric label="Trading days" value={String(rows.length)} />
                    <Metric label="Win rate" value={formatPercent(winRate)} />
                  </div>
                  {strategy.subscribeUrl && <a href={strategy.subscribeUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1c7c55] hover:underline">Strategy details <ArrowUpRight size={13} /></a>}
                </article>
              })}
            </section>

            <section className={`${panel} mb-4`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#75827a]">Daily breakdown</p><h2 className="mt-1 text-lg font-black">Trading date P&amp;L summary <span className="font-medium text-[#75827a]">· {currentDate || '—'}</span></h2></div>
                <p className="text-xs text-[#75827a]">Monthly figures include the selected month</p>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-[#75827a]"><tr><th className="pb-3 font-semibold">Strategy</th><th className="pb-3 text-right font-semibold">Capital</th><th className="pb-3 text-right font-semibold">Daily P&amp;L</th><th className="pb-3 text-right font-semibold">Monthly P&amp;L</th></tr></thead>
                  <tbody>{visibleStrategies.map((strategy) => {
                    const day = entries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate === currentDate).reduce((sum, entry) => sum + entry.pnl, 0)
                    const month = entries.filter((entry) => entry.strategyId === strategy.id && entry.tradeDate.startsWith(selectedMonth)).reduce((sum, entry) => sum + entry.pnl, 0)
                    return <tr key={strategy.id} className="border-t border-[#edf1eb]"><td className="py-3 font-semibold">{strategy.name}</td><td className="py-3 text-right tabular-nums">{formatMoney(strategy.capital)}</td><td className={`py-3 text-right font-bold tabular-nums ${positive(day)}`}>{formatMoney(day)}</td><td className={`py-3 text-right font-semibold tabular-nums ${positive(month)}`}>{formatMoney(month)}</td></tr>
                  })}</tbody>
                  <tfoot><tr className="border-t-2 border-[#dfe8dd]"><td className="pt-3 font-black">Total</td><td className="pt-3 text-right font-bold tabular-nums">{formatMoney(totalCapital)}</td><td className={`pt-3 text-right font-black tabular-nums ${positive(entries.filter((entry) => entry.tradeDate === currentDate).reduce((sum, entry) => sum + entry.pnl, 0))}`}>{formatMoney(entries.filter((entry) => entry.tradeDate === currentDate).reduce((sum, entry) => sum + entry.pnl, 0))}</td><td className={`pt-3 text-right font-black tabular-nums ${positive(entries.filter((entry) => entry.tradeDate.startsWith(selectedMonth)).reduce((sum, entry) => sum + entry.pnl, 0))}`}>{formatMoney(entries.filter((entry) => entry.tradeDate.startsWith(selectedMonth)).reduce((sum, entry) => sum + entry.pnl, 0))}</td></tr></tfoot>
                </table>
              </div>
            </section>

            <section className={`${panel} mb-4`}><ChartTitle title="Cumulative P&L" detail="Combined realized daily results" /><Chart points={daily} /></section>

            <section className="mb-4 grid gap-4 xl:grid-cols-2">
              <article className={panel}><ChartTitle title="Last 30 trading days" detail="Daily P&L" /><Chart points={daily.slice(-30)} /></article>
              <article className={panel}><ChartTitle title="Drawdown" detail="Distance from the cumulative peak" /><Chart points={history.slice().reverse()} drawdown /></article>
            </section>

            <section className="mb-4 grid gap-4 xl:grid-cols-2">
              <article className={panel}>
                <ChartTitle title="Daily P&L history" detail="Results by trading date" />
                <div className="mt-4 max-h-[390px] overflow-auto">
                  <table className="w-full min-w-[440px] text-sm"><thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wide text-[#75827a]"><tr><th className="pb-2 text-left font-semibold">Date</th><th className="pb-2 text-right font-semibold">Daily P&amp;L</th><th className="pb-2 text-right font-semibold">Daily ROI</th><th className="pb-2 text-right font-semibold">Drawdown</th></tr></thead><tbody>{history.map((point) => <tr key={point.date} className="border-t border-[#edf1eb]"><td className="py-2.5">{point.date}</td><td className={`py-2.5 text-right font-semibold tabular-nums ${positive(point.pnl)}`}>{formatMoney(point.pnl)}</td><td className="py-2.5 text-right tabular-nums">{formatPercent(totalCapital ? point.pnl / totalCapital * 100 : 0)}</td><td className={`py-2.5 text-right tabular-nums ${positive(point.drawdown ?? 0)}`}>{formatMoney(point.drawdown ?? 0)}</td></tr>)}</tbody></table>
                </div>
              </article>
              <article className={panel}>
                <ChartTitle title="Performance statistics" detail="Across the selected strategies" />
                <div className="mt-3 divide-y divide-[#edf1eb]">
                  <Stat label="Trading days" value={String(daily.length)} />
                  <Stat label="Winning days" value={String(daily.filter((point) => point.pnl > 0).length)} icon={<TrendingUp size={15} className="text-[#18805a]" />} />
                  <Stat label="Losing days" value={String(daily.filter((point) => point.pnl < 0).length)} icon={<TrendingDown size={15} className="text-[#c74f42]" />} />
                  <Stat label="Net P&L" value={formatMoney(totalPnl)} valueClass={positive(totalPnl)} />
                  <Stat label="Total ROI" value={formatPercent(totalCapital ? totalPnl / totalCapital * 100 : 0)} />
                  <Stat label="Best day" value={formatMoney(Math.max(0, ...daily.map((point) => point.pnl)))} valueClass="text-[#18805a]" />
                  <Stat label="Worst day" value={formatMoney(Math.min(0, ...daily.map((point) => point.pnl)))} valueClass="text-[#c74f42]" />
                </div>
              </article>
            </section>

            <section className="mb-4 grid gap-4 xl:grid-cols-2">
              <Rollup title="Monthly summary" rows={monthly} capital={totalCapital} />
              <Rollup title="Yearly summary" rows={yearly} capital={totalCapital} />
            </section>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dfe7dd] py-5 text-xs text-[#75827a]">
          <span className="inline-flex items-center gap-1.5"><CircleHelp size={14} /> P&amp;L values are reported in Indian rupees.</span>
          <span>Updated from daily strategy entries</span>
        </footer>
      </main>
    </div>
  )
}

function Brand({ name, logoUrl, compact = false }: { name: string; logoUrl?: string; compact?: boolean }) {
  const shortName = name.split(/[—–-]/)[0].trim() || 'DECAY HUNTERS'
  const initials = shortName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <Link href="/" aria-label="Decay Hunters home" className={`flex items-center gap-3 ${compact ? 'max-w-[220px]' : ''}`}>
    {logoUrl ? <img src={logoUrl} alt={`${shortName} logo`} className="h-10 w-10 shrink-0 rounded-xl object-contain" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d3e5d8] text-sm font-black tracking-tight text-[#1c704d]">{initials}</div>}
    <div className="min-w-0"><p className="truncate text-sm font-black tracking-wide">{shortName}</p><p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f987d]">P&amp;L Tracker</p></div>
  </Link>
}

function Metric({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return <div><p className="text-[11px] text-[#75827a]">{label}</p><p className={`mt-1 font-bold tabular-nums ${valueClass}`}>{value}</p></div>
}

function ChartTitle({ title, detail }: { title: string; detail: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-[#75827a]">{detail}</p></div></div>
}

function Stat({ label, value, valueClass = '', icon }: { label: string; value: string; valueClass?: string; icon?: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 py-3 text-sm"><span className="inline-flex items-center gap-2 text-[#52645a]">{icon}{label}</span><b className={`tabular-nums ${valueClass}`}>{value}</b></div>
}

function Rollup({ title, rows, capital }: { title: string; rows: [string, number][]; capital: number }) {
  return <article className={panel}>
    <ChartTitle title={title} detail="Aggregated daily results" />
    <div className="mt-4 max-h-[330px] overflow-auto"><table className="w-full text-sm"><tbody>{rows.map(([period, pnl]) => <tr key={period} className="border-t border-[#edf1eb]"><td className="py-2.5 font-medium">{period}</td><td className={`py-2.5 text-right font-semibold tabular-nums ${positive(pnl)}`}>{formatMoney(pnl)}</td><td className="py-2.5 text-right text-xs text-[#75827a]">{formatPercent(capital ? pnl / capital * 100 : 0)}</td></tr>)}</tbody></table></div>
    {!rows.length && <p className="mt-4 text-sm text-[#75827a]">No P&amp;L data yet.</p>}
  </article>
}

function dateRange(history: Point[]) {
  if (!history.length) return 'No trading dates yet'
  return `${history[history.length - 1].date} — ${history[0].date}`
}

function rollup(entries: TrackerEntry[], getKey: (entry: TrackerEntry) => string): [string, number][] {
  const totals = new Map<string, number>()
  entries.forEach((entry) => totals.set(getKey(entry), (totals.get(getKey(entry)) ?? 0) + entry.pnl))
  return [...totals].sort(([a], [b]) => b.localeCompare(a))
}
