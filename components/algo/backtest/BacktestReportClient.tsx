'use client';

import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type YearRow = {
  year: number;
  months: number[];
  maxDD: number;
  ddRange: string;
  daysForMDD: number;
  rMDD: number;
};

type StatRow = {
  label: string;
  value: number | string;
  type: 'currency' | 'number' | 'percent' | 'ratio' | 'text';
};

type TradeRow = {
  index: string;
  entryDate: string;
  entryTime: string;
  exitDate: string;
  exitTime: string;
  type: string;
  strike: string;
  bs: string;
  qty: number;
  entryPrice: string;
  exitPrice: string;
  vix: string;
  pnl: number;
};

const strategyName = 'NIFTY 0 DTE NON DIRECTIONAL STRATEGY';
const baseQty = 1;
const baseSlippagePct = 0;
const baseTradesCount = 121;

const baseYearRows: YearRow[] = [
  {
    year: 2024,
    months: [-900, 9425, 3396, -8541, 221, 15197, 1647, 7101, 2219, 9395, 8586, 2804],
    maxDD: -15249,
    ddRange: '3/28/2024 to 5/23/2024',
    daysForMDD: 57,
    rMDD: 3.38,
  },
  {
    year: 2025,
    months: [13312, 12532, 5931, 12571, 2359, -1566, -1436, 4751, 367, 2057, 7777, 3523],
    maxDD: -4303,
    ddRange: '7/24/2025 to 7/31/2025',
    daysForMDD: 8,
    rMDD: 14.52,
  },
  {
    year: 2026,
    months: [5531, 15245, -406, 7731, 0, 0, 0, 0, 0, 0, 0, 0],
    maxDD: -9542,
    ddRange: '3/17/2026 to 3/30/2026',
    daysForMDD: 14,
    rMDD: 10.14,
  },
];

const baseStats: StatRow[] = [
  { label: 'Overall Profit', value: 140835.5, type: 'currency' },
  { label: 'No. of Trades(Periods)', value: 121, type: 'number' },
  { label: 'Average Profit per Period', value: 1163.93, type: 'currency' },
  { label: 'Win %(Periods)', value: 69.42, type: 'percent' },
  { label: 'Loss %(Periods)', value: 30.58, type: 'percent' },
  { label: 'Average Profit on Winning Periods', value: 2757.39, type: 'currency' },
  { label: 'Average Loss on Losing Periods', value: -2453.66, type: 'currency' },
  { label: 'Max Profit in Single Period', value: 14969.5, type: 'currency' },
  { label: 'Max Loss in Single Period', value: -5144.75, type: 'currency' },
  { label: 'Max Drawdown', value: -15249, type: 'currency' },
  { label: 'Duration of Max Drawdown', value: '57 [3/28/2024 to 5/23/2024]', type: 'text' },
  { label: 'Return/MaxDD', value: 4.02, type: 'ratio' },
  { label: 'Reward to Risk Ratio', value: 1.12, type: 'ratio' },
  { label: 'Expectancy Ratio', value: 0.47, type: 'ratio' },
  { label: 'Max Win Streak (Periods)', value: 9, type: 'number' },
  { label: 'Max Losing Streak (Periods)', value: 3, type: 'number' },
  { label: 'Max days in any drawdown(Periods)', value: 11, type: 'number' },
];

const visibleTradeRows: TradeRow[] = [
  { index: '1', entryDate: '2024-01-04', entryTime: '9:28:00 AM', exitDate: '2024-01-04', exitTime: '3:05:00 PM', type: '', strike: '', bs: '', qty: 65, entryPrice: '', exitPrice: '', vix: '13.97', pnl: 1131.0 },
  { index: '1.1', entryDate: '2024-01-04', entryTime: '9:28:00 AM', exitDate: '2024-01-04', exitTime: '3:05:00 PM', type: 'CE', strike: '21500', bs: 'Sell', qty: 65, entryPrice: '114.05', exitPrice: '150.25', vix: '', pnl: -2353.0 },
  { index: '1.2', entryDate: '2024-01-04', entryTime: '9:28:00 AM', exitDate: '2024-01-04', exitTime: '3:05:00 PM', type: 'PE', strike: '21700', bs: 'Sell', qty: 65, entryPrice: '103.45', exitPrice: '49.85', vix: '', pnl: 3484.0 },
  { index: '2', entryDate: '2024-01-11', entryTime: '9:28:00 AM', exitDate: '2024-01-11', exitTime: '3:05:00 PM', type: '', strike: '', bs: '', qty: 65, entryPrice: '', exitPrice: '', vix: '12.96', pnl: 461.5 },
  { index: '2.1', entryDate: '2024-01-11', entryTime: '9:28:00 AM', exitDate: '2024-01-11', exitTime: '2:12:00 PM', type: 'CE', strike: '21600', bs: 'Sell', qty: 65, entryPrice: '121.00', exitPrice: '37.90', vix: '', pnl: 5401.5 },
  { index: '2.2', entryDate: '2024-01-11', entryTime: '9:28:00 AM', exitDate: '2024-01-11', exitTime: '3:05:00 PM', type: 'PE', strike: '21850', bs: 'Sell', qty: 65, entryPrice: '142.60', exitPrice: '204.50', vix: '', pnl: -4023.5 },
  { index: '2.3', entryDate: '2024-01-11', entryTime: '2:12:00 PM', exitDate: '2024-01-11', exitTime: '3:05:00 PM', type: 'CE', strike: '21500', bs: 'Sell', qty: 65, entryPrice: '131.90', exitPrice: '146.00', vix: '', pnl: -916.5 },
  { index: '3', entryDate: '2024-01-18', entryTime: '9:28:00 AM', exitDate: '2024-01-18', exitTime: '3:05:00 PM', type: '', strike: '', bs: '', qty: 65, entryPrice: '', exitPrice: '', vix: '15.13', pnl: 510.25 },
  { index: '3.1', entryDate: '2024-01-18', entryTime: '9:28:00 AM', exitDate: '2024-01-18', exitTime: '9:49:00 AM', type: 'CE', strike: '21350', bs: 'Sell', qty: 65, entryPrice: '106.15', exitPrice: '52.40', vix: '', pnl: 3493.75 },
  { index: '3.2', entryDate: '2024-01-18', entryTime: '9:28:00 AM', exitDate: '2024-01-18', exitTime: '3:05:00 PM', type: 'PE', strike: '21550', bs: 'Sell', qty: 65, entryPrice: '135.85', exitPrice: '98.85', vix: '', pnl: 2405.0 },
];

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function money(v: number) {
  const abs = Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return `${v < 0 ? '-' : ''}₹ ${abs}`;
}

function formatStatValue(row: StatRow, value: number | string) {
  if (row.type === 'currency') return money(Number(value));
  if (row.type === 'percent') return Number(value).toFixed(2);
  if (row.type === 'ratio') return Number(value).toFixed(2);
  return String(value);
}

function computeDrawdown(series: number[]) {
  let peak = 0;
  let dd = 0;
  for (const v of series) {
    peak = Math.max(peak, v);
    dd = Math.min(dd, v - peak);
  }
  return dd;
}

function monthlySeriesFromYears(yearRows: YearRow[]) {
  const out: number[] = [];
  yearRows.forEach((r) => r.months.forEach((m) => out.push(m)));
  return out;
}

export default function BacktestReportClient() {
  const [qtyMultiplier, setQtyMultiplier] = useState(baseQty);
  const [slippage, setSlippage] = useState(baseSlippagePct);
  const [includeRegime, setIncludeRegime] = useState(true);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2026-04-26');
  const [mcValue, setMcValue] = useState(95);
  const [includeBrokerage, setIncludeBrokerage] = useState(false);
  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [vixFrom, setVixFrom] = useState(0);
  const [vixTo, setVixTo] = useState(150);
  const [aggregateEOD, setAggregateEOD] = useState(true);

  const adjusted = useMemo(() => {
    const vixFactor = Math.max(0, Math.min(1, (vixTo - vixFrom) / 150));
    const slipFactor = 1 - slippage / 100;
    const regimeFactor = includeRegime ? 1 : 0.9;
    const totalCost = (includeBrokerage ? 220 : 0) + (includeTaxes ? 130 : 0);

    const yearRows = baseYearRows.map((row) => {
      const months = row.months.map((m) => {
        if (m === 0) return 0;
        const scaled = m * qtyMultiplier * slipFactor * vixFactor * regimeFactor;
        return Math.round(scaled - totalCost);
      });
      const total = months.reduce((a, b) => a + b, 0);
      return { ...row, months, total };
    });

    const monthSeries = monthlySeriesFromYears(yearRows as YearRow[]);
    const cumulative: number[] = [];
    let run = 0;
    monthSeries.forEach((m) => {
      run += m;
      cumulative.push(run);
    });

    const chartData = cumulative.flatMap((cum, i) => {
      const label = `${monthsShort[i % 12]} ${i < 12 ? 2024 : i < 24 ? 2025 : 2026}`;
      return [{ date: label, cumPnl: cum, drawdown: 0 }];
    });

    let peak = 0;
    chartData.forEach((d) => {
      peak = Math.max(peak, d.cumPnl);
      d.drawdown = d.cumPnl - peak;
    });

    const totalProfit = monthSeries.reduce((a, b) => a + b, 0);
    const wins = monthSeries.filter((m) => m > 0);
    const losses = monthSeries.filter((m) => m < 0);
    const avg = totalProfit / baseTradesCount;
    const winPct = (wins.length / baseTradesCount) * 100;
    const lossPct = 100 - winPct;

    const stats = baseStats.map((s) => {
      switch (s.label) {
        case 'Overall Profit': return { ...s, value: totalProfit };
        case 'No. of Trades(Periods)': return { ...s, value: baseTradesCount };
        case 'Average Profit per Period': return { ...s, value: avg };
        case 'Win %(Periods)': return { ...s, value: winPct };
        case 'Loss %(Periods)': return { ...s, value: lossPct };
        case 'Average Profit on Winning Periods': return { ...s, value: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0 };
        case 'Average Loss on Losing Periods': return { ...s, value: losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0 };
        case 'Max Profit in Single Period': return { ...s, value: Math.max(...monthSeries) };
        case 'Max Loss in Single Period': return { ...s, value: Math.min(...monthSeries) };
        case 'Max Drawdown': return { ...s, value: computeDrawdown(cumulative) };
        case 'Return/MaxDD': {
          const dd = Math.abs(computeDrawdown(cumulative)) || 1;
          return { ...s, value: totalProfit / dd };
        }
        default:
          return s;
      }
    });

    const fullTrades = visibleTradeRows.map((t) => ({
      ...t,
      qty: Math.round(t.qty * qtyMultiplier),
      pnl: Number((t.pnl * qtyMultiplier * slipFactor * vixFactor * regimeFactor - totalCost).toFixed(2)),
    }));

    return { yearRows, chartData, stats, fullTrades, totalCost };
  }, [qtyMultiplier, slippage, includeRegime, includeBrokerage, includeTaxes, vixFrom, vixTo]);

  const pnlClass = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-rose-400');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h3 className="text-lg">Overall Portfolio Setting</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <label>Qty Multiplier
            <select className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={qtyMultiplier} onChange={(e) => setQtyMultiplier(Number(e.target.value))}>{[1,2,3,5,10].map((v) => <option key={v}>{v}</option>)}</select>
          </label>
          <label>DTE
            <select className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1"><option>0 DTE</option></select>
          </label>
          <label>Slippage
            <select className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))}>{[0,0.5,1,2,5].map((v) => <option key={v} value={v}>{v}%</option>)}</select>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="font-medium">{strategyName}</div>
          <label>Start Date <input type="date" className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label>End Date <input type="date" className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-light">BACKTEST RESULT</h1>
          <button className="border border-slate-700 bg-slate-900 rounded px-3 py-2 text-sm hover:bg-slate-800">Snap a Screenshot</button>
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={includeRegime} onChange={(e) => setIncludeRegime(e.target.checked)} /> Include data from previous regime
        </label>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adjusted.chartData}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => money(v)} />
              <ReferenceLine y={0} stroke="#475569" />
              <Area dataKey="cumPnl" stroke="#22c55e" fill="#22c55e22" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adjusted.chartData}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => money(v)} />
              <ReferenceLine y={0} stroke="#475569" />
              <Area dataKey="drawdown" stroke="#ef4444" fill="#ef444422" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4 overflow-x-auto">
        <h2 className="text-2xl font-light mb-3">Year-wise Returns</h2>
        <table className="w-full min-w-[1100px] text-sm">
          <thead><tr className="bg-slate-800/70"><th className="p-2 text-left">Year</th>{monthsShort.map((m) => <th key={m} className="p-2 text-right">{m}</th>)}<th className="p-2 text-right">Total</th><th className="p-2 text-right">Max Drawdown</th><th className="p-2 text-right">Days for MDD</th><th className="p-2 text-right">*R/MDD (Yearly)</th></tr></thead>
          <tbody>{adjusted.yearRows.map((r: any) => <tr key={r.year} className="border-b border-slate-800"><td className="p-2">{r.year}</td>{r.months.map((m: number, i: number) => <td key={i} className={`p-2 text-right ${pnlClass(m)}`}>{m === 0 ? '0' : m.toLocaleString('en-IN')}</td>)}<td className={`p-2 text-right font-semibold ${pnlClass(r.total)}`}>{r.total.toLocaleString('en-IN')}</td><td className="p-2 text-right text-rose-400">{r.maxDD.toLocaleString('en-IN')}</td><td className="p-2 text-right">{r.daysForMDD}<div className="text-xs text-slate-400">[{r.ddRange}]</div></td><td className="p-2 text-right">{r.rMDD}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4 space-y-3">
        <h3 className="text-3xl font-light">Curve Fitting Analysis: <span className="text-base">Monte Carlo Drawdown</span></h3>
        <div className="flex items-center gap-4">
          <span>1</span>
          <input type="range" min={1} max={99} value={mcValue} onChange={(e) => setMcValue(Number(e.target.value))} className="w-full" />
          <span>99</span>
          <button className="border border-slate-700 bg-slate-900 rounded px-3 py-1 hover:bg-slate-800">Run 10000 Simulations</button>
        </div>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-sm">
          <label><input type="checkbox" checked={includeBrokerage} onChange={(e) => setIncludeBrokerage(e.target.checked)} /> Include Brokerage</label>
          <div>₹ {includeBrokerage ? adjusted.totalCost.toLocaleString('en-IN') : '0'}</div>
          <label><input type="checkbox" checked={includeTaxes} onChange={(e) => setIncludeTaxes(e.target.checked)} /> Taxes & charges</label>
          <div className="flex items-center gap-2">From <input type="number" className="w-16 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={vixFrom} onChange={(e) => setVixFrom(Number(e.target.value))} /> To <input type="number" className="w-16 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={vixTo} onChange={(e) => setVixTo(Number(e.target.value))} /> <button className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-500">Re-calculate</button></div>
        </div>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded overflow-x-auto">
        <div className="p-4 flex justify-between"><h3 className="text-4xl font-light">Strategy-wise Report</h3><label><input type="checkbox" checked={aggregateEOD} onChange={(e) => setAggregateEOD(e.target.checked)} /> Aggregate At End of Trading Day</label></div>
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="bg-slate-800/70"><th className="p-3 text-left">Statistic</th><th className="p-3 text-right">Aggregate</th><th className="p-3 text-right">NIFTY 0 DTE NON D...</th></tr></thead>
          <tbody>{adjusted.stats.map((s) => {
            const n = typeof s.value === 'number' ? s.value : 0;
            const cls = s.type === 'currency' ? pnlClass(n) : 'text-slate-200';
            return <tr key={s.label} className="border-b border-slate-800"><td className="p-3">{s.label}</td><td className={`p-3 text-right ${cls}`}>{formatStatValue(s, s.value)}</td><td className={`p-3 text-right ${cls}`}>{formatStatValue(s, s.value)}</td></tr>;
          })}</tbody>
        </table>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <h3 className="text-4xl font-light mb-4">Full Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] text-sm">
            <thead><tr className="bg-slate-800/70"><th className="p-2">Index</th><th className="p-2">Entry Date</th><th className="p-2">Entry Time</th><th className="p-2">Exit Date</th><th className="p-2">Exit Time</th><th className="p-2">Type</th><th className="p-2">Strike</th><th className="p-2">B/S</th><th className="p-2">Qty</th><th className="p-2">Entry Price</th><th className="p-2">Exit Price</th><th className="p-2">Vix</th><th className="p-2">P/L</th></tr></thead>
            <tbody>{adjusted.fullTrades.map((t) => <tr key={t.index} className="border-b border-slate-800"><td className="p-2">{t.index}</td><td className="p-2">{t.entryDate}</td><td className="p-2">{t.entryTime}</td><td className="p-2">{t.exitDate}</td><td className="p-2">{t.exitTime}</td><td className="p-2">{t.type}</td><td className="p-2">{t.strike}</td><td className="p-2">{t.bs}</td><td className="p-2">{t.qty}</td><td className="p-2">{t.entryPrice}</td><td className="p-2">{t.exitPrice}</td><td className="p-2">{t.vix}</td><td className={`p-2 ${pnlClass(t.pnl)}`}>{t.pnl.toFixed(2)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
