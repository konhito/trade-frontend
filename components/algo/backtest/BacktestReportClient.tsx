'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const STRATEGY_NAME = 'NIFTY 0 DTE NON DIRECTIONAL STRATEGY';

const YEAR_WISE_RETURNS = [
  {
    year: 2024,
    months: [-900, 9425, 3396, -541, 221, 15197, 1647, 7101, 2219, 9385, 8598, 2804],
    total: 50553, maxDD: -15249, ddRange: '3/28/2024 to 5/23/2024', daysForMDD: 57, rMDD: 3.38,
  },
  {
    year: 2025,
    months: [13312, 12532, 5931, 12571, 2359, -1566, -1436, 4751, 387, 2067, 7777, 3523],
    total: 62179, maxDD: -4303, ddRange: '7/24/2025 to 8/5/2025', daysForMDD: 8, rMDD: 14.52,
  },
  {
    year: 2026,
    months: [5531, 15245, -406, 7731, 0, 0, 0, 0, 0, 0, 0, 0],
    total: 28102, maxDD: -9542, ddRange: '3/17/2026 to 3/30/2026', daysForMDD: 14, rMDD: 10.14,
  },
];

const STRATEGY_STATS = [
  { label: 'Overall Profit', value: 140835.5, type: 'currency' },
  { label: 'No. of Trades (Periods)', value: 121, type: 'number' },
  { label: 'Average Profit per Period', value: 1163.93, type: 'currency' },
  { label: 'Win % (Periods)', value: 69.42, type: 'percent' },
  { label: 'Loss % (Periods)', value: 30.58, type: 'percent_neg' },
  { label: 'Average Profit on Winning Periods', value: 2757.39, type: 'currency' },
  { label: 'Average Loss on Losing Periods', value: -2453.66, type: 'currency' },
  { label: 'Max Profit in Single Period', value: 14969.5, type: 'currency' },
  { label: 'Max Loss in Single Period', value: -5144.75, type: 'currency' },
  { label: 'Max Drawdown', value: -15249, type: 'currency' },
  { label: 'Duration of Max Drawdown', value: '57 (3/28/2024 to 5/23/2024)', type: 'text' },
  { label: 'Return/MaxDD', value: 4.92, type: 'ratio' },
  { label: 'Reward to Risk Ratio', value: 5.12, type: 'ratio' },
  { label: 'Expectancy Ratio', value: 0.47, type: 'ratio' },
  { label: 'Max Win Streak (Periods)', value: 9, type: 'number' },
  { label: 'Max Losing Streak (Periods)', value: 1, type: 'number' },
  { label: 'Max days in any drawdown (Periods)', value: 57, type: 'number' },
];

// ─── Generate chart data ──────────────────────────────────────────────────────

function generateChartData() {
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data: { date: string; cumPnl: number; drawdown: number }[] = [];
  let cumulative = 0;

  for (const row of YEAR_WISE_RETURNS) {
    for (let m = 0; m < 12; m++) {
      const val = row.months[m];
      if (val === 0 && row.year === 2026 && m >= 4) break;
      const prevCum = cumulative;
      cumulative += val;
      for (let d = 1; d <= 5; d++) {
        const fraction = d / 5;
        const noise = Math.sin(d * 3.14 + m * 7) * Math.abs(val) * 0.04;
        const pnl = Math.round(prevCum + val * fraction + noise);
        data.push({ date: d === 3 ? `${MONTH_NAMES[m]} ${row.year}` : '', cumPnl: pnl, drawdown: 0 });
      }
    }
  }

  // Compute proper drawdown from rolling peak
  let peak = 0;
  for (const d of data) {
    if (d.cumPnl > peak) peak = d.cumPnl;
    d.drawdown = d.cumPnl - peak;
  }
  return data;
}

const CHART_DATA = generateChartData();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fCurrency = (n: number) => {
  if (n === 0) return '₹0';
  const s = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return (n < 0 ? '-₹' : '₹') + s;
};

const valColor = (n: number) => n > 0 ? 'text-emerald-400' : n < 0 ? 'text-rose-400' : 'text-slate-500';
const cellBg = (n: number) => n > 0 ? 'bg-emerald-500/10' : n < 0 ? 'bg-rose-500/10' : '';

const tooltipStyle = { backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', fontSize: 12 };

function formatStat(stat: { value: number | string; type: string }) {
  if (stat.type === 'text') return { display: String(stat.value), color: 'text-slate-300' };
  const n = Number(stat.value);
  if (stat.type === 'currency') return { display: fCurrency(n), color: n >= 0 ? 'text-emerald-400' : 'text-rose-400' };
  if (stat.type === 'percent') return { display: n.toFixed(2), color: 'text-emerald-400' };
  if (stat.type === 'percent_neg') return { display: n.toFixed(2), color: 'text-rose-400' };
  if (stat.type === 'ratio') return { display: n.toFixed(2), color: 'text-indigo-300' };
  return { display: `${n}`, color: 'text-slate-200' };
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BacktestReportClient() {
  const [qty, setQty] = useState(1);
  const [dte, setDte] = useState('0 DTE');
  const [slippage, setSlippage] = useState(0);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2026-04-26');
  const [includeRegime, setIncludeRegime] = useState(true);

  const [mcValue, setMcValue] = useState(96);
  const [simRunning, setSimRunning] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [simResult, setSimResult] = useState<number | null>(null);

  const [includeBrokerage, setIncludeBrokerage] = useState(false);
  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [vixFrom, setVixFrom] = useState(0);
  const [vixTo, setVixTo] = useState(150);
  const [recalculating, setRecalculating] = useState(false);
  const [aggregateEOD, setAggregateEOD] = useState(true);

  const handleRunSimulations = useCallback(() => {
    setSimRunning(true); setSimDone(false);
    setTimeout(() => {
      setSimRunning(false); setSimDone(true);
      setSimResult(-(Math.round(15249 * (1 - mcValue / 200))));
    }, 2200);
  }, [mcValue]);

  const handleRecalculate = useCallback(() => {
    setRecalculating(true);
    setTimeout(() => setRecalculating(false), 1200);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">

      {/* ── Standalone Top Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 bg-slate-950/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-white tracking-tight text-sm hover:text-indigo-400 transition">
            MyTradeJournal
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-400">Backtest Report</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/algo" className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
            ← Algo Lab
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
            📸 Snap a Screenshot
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* ── 1. Portfolio Settings ────────────────────────────────────────── */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Overall Portfolio Setting</p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Strategy chip */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600">
                <span className="text-[8px] font-black text-white">✓</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{STRATEGY_NAME}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">NIFTY · INTRADAY</p>
              </div>
            </div>

            {/* Qty Multiplier */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Qty Multiplier</span>
              <select value={qty} onChange={e => setQty(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-white outline-none">
                {[1, 2, 3, 5, 10].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* DTE tabs */}
            <div className="flex overflow-hidden rounded-lg border border-slate-700">
              {['DTE', 'Weekdays', 'Budget Days'].map(l => (
                <button key={l} className="border-r border-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white last:border-0">{l}</button>
              ))}
            </div>

            {/* DTE value */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
              <select value={dte} onChange={e => setDte(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none">
                {['0 DTE', '1 DTE', '2 DTE', '3 DTE'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            {/* Slippage */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Slippage</span>
              <select value={slippage} onChange={e => setSlippage(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-white outline-none">
                {[0, 1, 2, 5].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-500">Start Date</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500" />
              <span className="text-slate-500">End Date</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        {/* ── Backtest result header ───────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-white">BACKTEST RESULT</h1>
            <div className="flex items-center gap-2">
              <Toggle value={includeRegime} onChange={setIncludeRegime} />
              <span className="text-xs text-slate-400">Include data from previous regime</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs leading-relaxed text-amber-400/80">
          Following results are backtested results on historical data. These historical simulations do not represent actual trading and have not been executed in the live market.{' '}
          <span className="cursor-pointer underline">Know more</span>
        </div>

        {/* ── 2. Cumulative PnL Chart ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cumulative PnL</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white">
              ↺ Reset Zoom
            </button>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumPnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false}
                  axisLine={{ stroke: '#334155' }} interval={4} tick={{ fill: '#64748b' }} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={58}
                  tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: number) => [fCurrency(val), 'Cumulative PnL']} />
                <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="cumPnl" stroke="#10b981" strokeWidth={2}
                  fill="url(#cumPnlGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 3. Drawdown Chart ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-sm bg-rose-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Drawdown</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white">
              ↺ Reset Zoom
            </button>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false}
                  axisLine={{ stroke: '#334155' }} interval={4} tick={{ fill: '#64748b' }} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={58}
                  tickFormatter={v => v === 0 ? '0' : `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: number) => [fCurrency(val), 'Drawdown']} />
                <ReferenceLine y={0} stroke="#334155" />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5}
                  fill="url(#ddGrad)" dot={false} activeDot={{ r: 3, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 4. Year-wise Returns Table ───────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-base font-extrabold tracking-tight text-white">Year-wise Returns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-4 py-3 text-left">Year</th>
                  {MONTHS.map(m => <th key={m} className="px-2 py-3 text-right">{m}</th>)}
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Max Drawdown</th>
                  <th className="px-3 py-3 text-right">Days MDD</th>
                  <th className="px-3 py-3 text-right">*R/MDD</th>
                </tr>
              </thead>
              <tbody>
                {YEAR_WISE_RETURNS.map(row => (
                  <tr key={row.year} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-white">{row.year}</td>
                    {row.months.map((val, i) => {
                      const hidden = val === 0 && row.year === 2026 && i >= 4;
                      return (
                        <td key={i} className={`px-2 py-3 text-right font-mono ${hidden ? '' : cellBg(val)}`}>
                          {hidden
                            ? <span className="text-slate-700">—</span>
                            : <span className={valColor(val)}>{fCurrency(val).replace('₹', '').replace('-₹', '-')}</span>
                          }
                        </td>
                      );
                    })}
                    <td className={`px-4 py-3 text-right font-mono font-bold ${valColor(row.total)}`}>{fCurrency(row.total)}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono font-bold text-rose-400">{fCurrency(row.maxDD)}</p>
                      <p className="mt-0.5 text-[9px] text-slate-500">{row.ddRange}</p>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-300">{row.daysForMDD}</td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-indigo-400">{row.rMDD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. Curve Fitting / Monte Carlo ──────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white">Curve Fitting Analysis:</h2>
              <span className="text-sm text-slate-400">Monte Carlo Drawdown</span>
              <span title="Runs Monte Carlo simulations to assess curve-fitting risk" className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[10px] text-slate-400">ⓘ</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>1</span>
                <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 font-bold text-sm text-white shadow-inner">{mcValue}</span>
                <span>99</span>
              </div>
              <input type="range" min={1} max={99} value={mcValue}
                onChange={e => { setMcValue(Number(e.target.value)); setSimDone(false); }}
                className="h-1.5 w-full cursor-pointer accent-indigo-500" />
            </div>
            <button onClick={handleRunSimulations} disabled={simRunning}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {simRunning ? <><span className="animate-spin">⟳</span> Running...</> : <>▶ Run 10000 Simulations</>}
            </button>
          </div>
          {simDone && simResult !== null && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 duration-300">
              <p className="mb-1 text-xs text-slate-400">Monte Carlo Max Drawdown at <strong className="text-white">{mcValue}th percentile</strong></p>
              <p className="font-mono text-2xl font-black text-rose-400">{fCurrency(simResult)}</p>
              <p className="mt-1 text-[10px] text-slate-500">Based on 10,000 simulations of shuffled trade sequences</p>
            </div>
          )}
        </div>

        {/* ── 6. Brokerage, Taxes & VIX Range ─────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <h2 className="mb-4 text-base font-bold tracking-tight text-white">Brokerage, Taxes &amp; Analysis:</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Brokerage */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Include Brokerage</span>
                <Toggle value={includeBrokerage} onChange={setIncludeBrokerage} />
              </div>
              <p className="font-mono text-lg font-bold text-slate-400">
                {includeBrokerage ? <span className="text-white">₹20 / trade</span> : <>₹ 0 <span className="text-xs text-slate-600">//</span></>}
              </p>
            </div>
            {/* Taxes */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-300">Taxes &amp; charges</span>
                <Toggle value={includeTaxes} onChange={setIncludeTaxes} />
              </div>
              <p className={`font-mono text-lg font-bold ${includeTaxes ? 'text-white' : 'text-slate-400'}`}>
                ₹ 6,116.13 {!includeTaxes && <span className="text-xs text-slate-600">//</span>}
              </p>
            </div>
            {/* VIX */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <span className="text-sm font-semibold text-slate-300">Select VIX Range</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">From</span>
                <input type="number" value={vixFrom} onChange={e => setVixFrom(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm font-mono text-white outline-none focus:border-indigo-500" />
                <span className="text-xs text-slate-500">To</span>
                <input type="number" value={vixTo} onChange={e => setVixTo(Number(e.target.value))}
                  className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm font-mono text-white outline-none focus:border-indigo-500" />
                <button onClick={handleRecalculate} disabled={recalculating}
                  className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:opacity-60">
                  {recalculating ? <><span className="animate-spin text-xs">⟳</span> ...</> : 'Re-calculate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 7. Strategy-wise Report Stats ────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">Strategy-wise Report</h2>
              <p className="mt-0.5 text-[10px] text-slate-500">* The returns are annualized for calculation</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <Toggle value={aggregateEOD} onChange={setAggregateEOD} />
              <span className="text-xs text-slate-400">Aggregate At End of Trading Day</span>
              <span title="Aggregates all strategy legs at end of day" className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[9px] text-slate-400">ⓘ</span>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3 text-left">Statistic</th>
                  <th className="px-6 py-3 text-right text-indigo-400">Aggregate</th>
                  <th className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />
                      <span className="max-w-[130px] truncate" title={STRATEGY_NAME}>NIFTY 0 DTE NON D...</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {STRATEGY_STATS.map((stat, i) => {
                  const f = formatStat(stat);
                  return (
                    <tr key={i} className="transition-colors hover:bg-slate-800/30">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-300">{stat.label}</p>
                        <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-600">MYTRADEJOURNAL.COM</p>
                      </td>
                      <td className={`px-6 py-3.5 text-right font-mono font-semibold ${f.color}`}>{f.display}</td>
                      <td className={`px-6 py-3.5 text-right font-mono font-semibold ${f.color}`}>{f.display}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center">
          <span className="text-sm font-bold tracking-widest text-slate-700">AlgoTest.in</span>
        </div>
      </div>
    </div>
  );
}
