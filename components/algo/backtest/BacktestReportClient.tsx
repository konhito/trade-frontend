'use client';

import React, { useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
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

const baseQty = 1;
const baseSlippagePct = 0.5;
const baseTradesCount = 662;
const baseBrokerageCost = 0;
const baseTaxAndChargesBreakdown = [
  { label: 'Clearing Charges', value: 0 },
  { label: 'IPFT', value: 108.3 },
  { label: 'STT', value: 16838.83 },
  { label: 'Stamp Duty', value: 313.01 },
  { label: 'SEBI Charges', value: 21.66 },
  { label: 'Exchange Charges', value: 7587.3 },
  { label: 'GST (18%)', value: 1369.61 },
];
const baseTaxAndChargesTotal = baseTaxAndChargesBreakdown.reduce((sum, c) => sum + c.value, 0);

const baseYearRows: YearRow[] = [
  {
    year: 2020,
    months: [3149, 1342, 3159, 19831, 5921, 3214, 11804, 2863, 1576, 3857, 14768, 6581],
    maxDD: -15912,
    ddRange: '3/19/2020 to 3/19/2020',
    daysForMDD: 1,
    rMDD: 4.9,
  },
  {
    year: 2021,
    months: [4780, 7631, 9574, 8086, 4605, 5460, 12616, -136, 5174, 13338, 2226, 21992],
    maxDD: -3396,
    ddRange: '3/4/2021 to 3/4/2021',
    daysForMDD: 1,
    rMDD: 28.62,
  },
  {
    year: 2022,
    months: [8264, 13663, 18911, 4228, 15184, 19155, 7520, 4888, 10718, 13386, 9746, 3448],
    maxDD: -6418,
    ddRange: '4/28/2022 to 5/5/2022',
    daysForMDD: 8,
    rMDD: 20.5,
  },
  {
    year: 2023,
    months: [-6165, 8427, 11033, -1085, 3584, 555, 7767, -390, -331, 2778, 3318, 24521],
    maxDD: -6165,
    ddRange: '1/5/2023 to 1/25/2023',
    daysForMDD: 21,
    rMDD: 8.93,
  },
  {
    year: 2024,
    months: [1781, 10146, 7861, -2115, 1088, 19730, 14361, 23949, -2167, 40030, 16318, 14943],
    maxDD: -18395,
    ddRange: '11/28/2024 to 12/12/2024',
    daysForMDD: 15,
    rMDD: 8.08,
  },
  {
    year: 2025,
    months: [33748, 14755, 11206, 52555, 28489, 4400, 2863, 3503, 12233, 12402, 12272, 12688],
    maxDD: -5941,
    ddRange: '4/17/2025 to 4/30/2025',
    daysForMDD: 14,
    rMDD: 34.03,
  },
  {
    year: 2026,
    months: [18557, 48317, -16796, 38649, 0, 0, 0, 0, 0, 0, 0, 0],
    maxDD: -24300,
    ddRange: '3/10/2026 to 3/30/2026',
    daysForMDD: 21,
    rMDD: 11.79,
  },
];

const baseStats: StatRow[] = [
  { label: 'Overall Profit', value: 792320.75, type: 'currency' },
  { label: 'No. of Trades(Periods)', value: 662, type: 'number' },
  { label: 'Average Profit per Period', value: 2393.72, type: 'currency' },
  { label: 'Win %(Periods)', value: 64.35, type: 'percent' },
  { label: 'Loss %(Periods)', value: 35.65, type: 'percent' },
  { label: 'Average Profit on Winning Periods', value: 4829.99, type: 'currency' },
  { label: 'Average Loss on Losing Periods', value: -2003.96, type: 'currency' },
  { label: 'Max Profit in Single Period', value: 46764.25, type: 'currency' },
  { label: 'Max Loss in Single Period', value: -15912, type: 'currency' },
  { label: 'Max Drawdown', value: -24300.25, type: 'currency' },
  { label: 'Duration of Max Drawdown', value: '21 [3/10/2026 to 3/30/2026]', type: 'text' },
  { label: 'Return/MaxDD', value: 5.15, type: 'ratio' },
  { label: 'Reward to Risk Ratio', value: 1.41, type: 'ratio' },
  { label: 'Expectancy Ratio', value: 1.19, type: 'ratio' },
  { label: 'Max Win Streak (Periods)', value: 13, type: 'number' },
  { label: 'Max Losing Streak (Periods)', value: 6, type: 'number' },
  { label: 'Max days in any drawdown(Periods)', value: 9, type: 'number' },
];


const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function money(v: number) {
  const abs = Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return `${v > 0 ? '+' : v < 0 ? '-' : ''}₹ ${abs}`;
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

function computeDrawdownDetails(series: number[]) {
  let peak = 0;
  let peakIdx = -1;
  let maxDD = 0;
  let troughIdx = -1;

  series.forEach((v, i) => {
    if (v > peak) {
      peak = v;
      peakIdx = i;
    }
    const dd = v - peak;
    if (dd < maxDD) {
      maxDD = dd;
      troughIdx = i;
    }
  });

  const startIdx = peakIdx >= 0 ? peakIdx : troughIdx;
  const days = maxDD < 0 && troughIdx >= 0 && startIdx >= 0 ? troughIdx - startIdx + 1 : 0;
  return { maxDD, startIdx, troughIdx, days };
}

function computeStreaks(series: number[]) {
  let maxWin = 0;
  let maxLoss = 0;
  let curWin = 0;
  let curLoss = 0;

  series.forEach((v) => {
    if (v > 0) {
      curWin += 1;
      curLoss = 0;
    } else if (v < 0) {
      curLoss += 1;
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
    if (curWin > maxWin) maxWin = curWin;
    if (curLoss > maxLoss) maxLoss = curLoss;
  });

  return { maxWin, maxLoss };
}

export default function BacktestReportClient() {
  const [qtyMultiplier, setQtyMultiplier] = useState(baseQty);
  const [slippage, setSlippage] = useState(baseSlippagePct);
  const [includeRegime, setIncludeRegime] = useState(true);
  const [startDate, setStartDate] = useState('2020-01');
  const [endDate, setEndDate] = useState('2026-05');
  const [includeBrokerage, setIncludeBrokerage] = useState(false);
  const [includeTaxAndCharges, setIncludeTaxAndCharges] = useState(false);
  const [vixFrom, setVixFrom] = useState(0);
  const [vixTo, setVixTo] = useState(150);
  const [aggregateEOD, setAggregateEOD] = useState(true);

  const handleSnapshot = async () => {
    const node = document.getElementById('backtest-report-root');
    if (!node) return;

    const canvas = await html2canvas(node, {
      backgroundColor: '#020617',
      useCORS: true,
      scale: 2,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `backtest-report-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
  };

  const adjusted = useMemo(() => {
    const startBoundary = `${startDate}-01`;
    const endBoundary = `${endDate}-31`;
    const allMonths = baseYearRows.flatMap((row) =>
      row.months.map((value, monthIndex) => {
        const month = String(monthIndex + 1).padStart(2, '0');
        const monthKey = `${row.year}-${month}`;
        const inRange = monthKey >= startBoundary.slice(0, 7) && monthKey <= endBoundary.slice(0, 7);
        return { year: row.year, monthIndex, monthKey, value, inRange };
      })
    );
    const activeMonthsCount = allMonths.filter((m) => m.inRange).length;
    // Exclude placeholder/future zero months from scaling math.
    const nonZeroMonths = allMonths.filter((m) => m.value !== 0);
    const activeNonZeroMonthsCount = nonZeroMonths.filter((m) => m.inRange).length;
    const totalNonZeroMonthsCount = nonZeroMonths.length;
    const totalMonthsCount = allMonths.length;
    const tradeCount = Math.max(1, Math.round((baseTradesCount * activeMonthsCount) / totalMonthsCount));

    const vixFactor = Math.max(0, Math.min(1, (vixTo - vixFrom) / 150));
    const slipFactor = 1 - slippage / 100;
    const regimeFactor = includeRegime ? 1 : 0.9;
    const rangeFactor =
      totalNonZeroMonthsCount > 0
        ? activeNonZeroMonthsCount / totalNonZeroMonthsCount
        : totalMonthsCount > 0
          ? activeMonthsCount / totalMonthsCount
          : 0;
    const brokerageCost = includeBrokerage ? baseBrokerageCost * qtyMultiplier * rangeFactor : 0;
    const taxAndChargesCost = includeTaxAndCharges ? baseTaxAndChargesTotal * qtyMultiplier * rangeFactor : 0;
    const totalCost = brokerageCost + taxAndChargesCost;
    const activePnLMonths = allMonths.filter((m) => m.inRange && m.value !== 0).length;
    const perMonthCost = activePnLMonths > 0 ? totalCost / activePnLMonths : 0;

    const yearRows = baseYearRows.map((row) => {
      const months = row.months.map((m, monthIndex) => {
        const month = String(monthIndex + 1).padStart(2, '0');
        const monthKey = `${row.year}-${month}`;
        if (monthKey < startBoundary.slice(0, 7) || monthKey > endBoundary.slice(0, 7)) {
          return 0;
        }
        if (m === 0) return 0;
        const scaled = m * qtyMultiplier * slipFactor * vixFactor * regimeFactor;
        return Math.round(scaled - perMonthCost);
      });
      const total = months.reduce((a, b) => a + b, 0);
      const monthsInRange = months
        .map((v, i) => ({ v, i }))
        .filter((x) => x.v !== 0);
      const yearCumulative: number[] = [];
      let run = 0;
      monthsInRange.forEach((m) => {
        run += m.v;
        yearCumulative.push(run);
      });
      const yearDD = yearCumulative.length ? computeDrawdownDetails(yearCumulative) : { maxDD: 0, startIdx: -1, troughIdx: -1, days: 0 };
      const scaledBaseYearMaxDD = Math.round(row.maxDD * qtyMultiplier * slipFactor * vixFactor * regimeFactor);
      const hasAnyActiveMonth = monthsInRange.length > 0;
      const yearMaxDD = hasAnyActiveMonth ? scaledBaseYearMaxDD : 0;
      const yearRMDD = Math.abs(yearMaxDD) > 0 ? Number((total / Math.abs(yearMaxDD)).toFixed(2)) : 0;
      let ddRange = row.ddRange;
      if (yearDD.maxDD < 0 && yearDD.startIdx >= 0 && yearDD.troughIdx >= 0) {
        const startMonthIdx = monthsInRange[yearDD.startIdx]?.i;
        const endMonthIdx = monthsInRange[yearDD.troughIdx]?.i;
        if (startMonthIdx !== undefined && endMonthIdx !== undefined) {
          ddRange = `1/${startMonthIdx + 1}/${row.year} to 28/${endMonthIdx + 1}/${row.year}`;
        }
      }
      return { ...row, months, total, maxDD: yearMaxDD, rMDD: yearRMDD, daysForMDD: yearDD.days, ddRange };
    });

    const filteredMonthSeries = allMonths
      .filter((m) => m.inRange)
      .map((m) => {
        if (m.value === 0) return 0;
        const scaled = m.value * qtyMultiplier * slipFactor * vixFactor * regimeFactor;
        return Math.round(scaled - perMonthCost);
      });

    const monthSeries = filteredMonthSeries;
    const cumulative: number[] = [];
    let run = 0;
    monthSeries.forEach((m) => {
      run += m;
      cumulative.push(run);
    });

    const yearMonthLabels = allMonths
      .filter((m) => m.inRange)
      .map((m) => `${monthsShort[m.monthIndex]} ${m.year}`);
    const chartData = cumulative.map((cum, i) => ({
      date: yearMonthLabels[i] ?? `M${i + 1}`,
      cumPnl: cum,
      drawdown: 0,
    }));

    let peak = 0;
    chartData.forEach((d) => {
      peak = Math.max(peak, d.cumPnl);
      d.drawdown = d.cumPnl - peak;
    });

    const totalProfit = monthSeries.reduce((a, b) => a + b, 0);
    const wins = monthSeries.filter((m) => m > 0);
    const losses = monthSeries.filter((m) => m < 0);
    const avg = totalProfit / tradeCount;
    const winPct = (wins.length / tradeCount) * 100;
    const lossPct = 100 - winPct;

    const winsSum = wins.reduce((a, b) => a + b, 0);
    const lossesSum = losses.reduce((a, b) => a + b, 0);
    const avgWin = wins.length ? winsSum / wins.length : 0;
    const avgLoss = losses.length ? lossesSum / losses.length : 0;
    const absAvgLoss = Math.abs(avgLoss) || 1;
    const rewardRisk = avgWin / absAvgLoss;
    const expectancy = (winPct / 100) * (avgWin / absAvgLoss) - (lossPct / 100);
    const ddDetails = computeDrawdownDetails(cumulative);
    const retMaxDD = Math.abs(ddDetails.maxDD) > 0 ? totalProfit / Math.abs(ddDetails.maxDD) : 0;
    const streaks = computeStreaks(monthSeries);

    const stats = baseStats.map((s) => {
      switch (s.label) {
        case 'Overall Profit': return { ...s, value: totalProfit };
        case 'No. of Trades(Periods)': return { ...s, value: tradeCount };
        case 'Average Profit per Period': return { ...s, value: avg };
        case 'Win %(Periods)': return { ...s, value: winPct };
        case 'Loss %(Periods)': return { ...s, value: lossPct };
        case 'Average Profit on Winning Periods': return { ...s, value: avgWin };
        case 'Average Loss on Losing Periods': return { ...s, value: avgLoss };
        case 'Max Profit in Single Period': return { ...s, value: Math.max(...monthSeries) };
        case 'Max Loss in Single Period': return { ...s, value: Math.min(...monthSeries) };
        case 'Max Drawdown': return { ...s, value: ddDetails.maxDD };
        case 'Duration of Max Drawdown': {
          if (ddDetails.maxDD >= 0 || ddDetails.startIdx < 0 || ddDetails.troughIdx < 0) return { ...s, value: '0' };
          const startLabel = yearMonthLabels[ddDetails.startIdx] ?? '';
          const endLabel = yearMonthLabels[ddDetails.troughIdx] ?? '';
          return { ...s, value: `${ddDetails.days} [${startLabel} to ${endLabel}]` };
        }
        case 'Return/MaxDD': return { ...s, value: retMaxDD };
        case 'Reward to Risk Ratio': return { ...s, value: rewardRisk };
        case 'Expectancy Ratio': return { ...s, value: expectancy };
        case 'Max Win Streak (Periods)': return { ...s, value: streaks.maxWin };
        case 'Max Losing Streak (Periods)': return { ...s, value: streaks.maxLoss };
        case 'Max days in any drawdown(Periods)': return { ...s, value: ddDetails.days };
        default:
          return s;
      }
    });

    const scaledTaxBreakdown = baseTaxAndChargesBreakdown.map((item) => ({
      ...item,
      value: item.value * qtyMultiplier * rangeFactor,
    }));

    return { yearRows, chartData, stats, totalCost, taxAndChargesCost, brokerageCost, scaledTaxBreakdown };
  }, [qtyMultiplier, slippage, includeRegime, includeBrokerage, includeTaxAndCharges, vixFrom, vixTo, startDate, endDate]);

  const pnlClass = (v: number) => (v >= 0 ? 'text-emerald-400' : 'text-rose-400');

  return (
    <div id="backtest-report-root" className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
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
            <select className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))}>{[0.5].map((v) => <option key={v} value={v}>{v.toFixed(2)}%</option>)}</select>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="font-medium">Strategy hidden</div>
          <label>Start Month <input type="month" className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label>End Month <input type="month" className="ml-2 border border-slate-700 bg-slate-900 rounded px-2 py-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-light">BACKTEST RESULT</h1>
          <button onClick={handleSnapshot} className="border border-slate-700 bg-slate-900 rounded px-3 py-2 text-sm hover:bg-slate-800">Snap a Screenshot</button>
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={includeRegime} onChange={(e) => setIncludeRegime(e.target.checked)} /> Include data from previous regime
        </label>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adjusted.chartData} margin={{ top: 16, right: 20, bottom: 8, left: 20 }}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis
                tick={{ fill: '#94a3b8' }}
                domain={['dataMin - 5000', 'dataMax + 5000']}
                width={80}
                label={{ value: 'Cumulative PnL', angle: -90, position: 'insideLeft', offset: -4, fill: '#cbd5e1', fontSize: 12 }}
              />
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
            <AreaChart data={adjusted.chartData} margin={{ top: 16, right: 20, bottom: 8, left: 20 }}>
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis
                tick={{ fill: '#94a3b8' }}
                width={80}
                label={{ value: 'Drawdown', angle: -90, position: 'insideLeft', offset: -4, fill: '#cbd5e1', fontSize: 12 }}
              />
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
          <thead><tr className="bg-slate-800/70"><th className="p-2 text-left">Year</th>{monthsShort.map((m) => <th key={m} className="p-2 text-right">{m}</th>)}<th className="p-2 text-right">Total</th><th className="p-2 text-right">Max Drawdown</th></tr></thead>
          <tbody>{adjusted.yearRows.map((r: any) => <tr key={r.year} className="border-b border-slate-800"><td className="p-2">{r.year}</td>{r.months.map((m: number, i: number) => <td key={i} className={`p-2 text-right ${pnlClass(m)}`}>{m === 0 ? '0' : m.toLocaleString('en-IN')}</td>)}<td className={`p-2 text-right font-semibold ${pnlClass(r.total)}`}>{r.total.toLocaleString('en-IN')}</td><td className="p-2 text-right text-rose-400">{r.maxDD.toLocaleString('en-IN')}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end text-sm">
          <div className="space-y-2">
            <label><input type="checkbox" checked={includeBrokerage} onChange={(e) => setIncludeBrokerage(e.target.checked)} /> Include Brokerage</label>
          </div>
          <div>₹ {adjusted.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeTaxAndCharges}
              onChange={(e) => setIncludeTaxAndCharges(e.target.checked)}
            />
            Tax and charges
          </label>
        </div>
        {includeTaxAndCharges && (
          <div className="mt-3 text-xs text-slate-400 space-y-1">
            {adjusted.scaledTaxBreakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span>₹ {item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-slate-800 bg-slate-900/60 rounded overflow-x-auto">
        <div className="p-4 flex justify-between"><h3 className="text-4xl font-light">Strategy-wise Report</h3><label><input type="checkbox" checked={aggregateEOD} onChange={(e) => setAggregateEOD(e.target.checked)} /> Aggregate At End of Trading Day</label></div>
        <table className="w-full min-w-[900px] text-sm">
          <thead><tr className="bg-slate-800/70"><th className="p-3 text-left">Statistic</th><th className="p-3 text-right">Aggregate</th></tr></thead>
          <tbody>{adjusted.stats.map((s) => {
            const n = typeof s.value === 'number' ? s.value : 0;
            const cls = s.type === 'currency' ? pnlClass(n) : 'text-slate-200';
            return <tr key={s.label} className="border-b border-slate-800"><td className="p-3">{s.label}</td><td className={`p-3 text-right ${cls}`}>{formatStatValue(s, s.value)}</td></tr>;
          })}</tbody>
        </table>
      </section>

      <section className="mt-6 md:mt-10 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-6 md:p-10 shadow-[0_0_55px_-18px_rgba(34,211,238,0.5)]">
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Built for serious traders and investors</h3>
          <p className="text-slate-300 text-sm md:text-base">
            Get verified live performance snapshots, full strategy logic, and a capital plan tailored to your risk profile.
          </p>
        </div>
        <div className="mt-6 md:mt-8 flex flex-wrap gap-3">
          <a href="https://t.me/DECAYHUNTERS" target="_blank" rel="noopener noreferrer" className="bg-cyan-500 text-slate-950 rounded-md px-4 py-2.5 text-sm font-medium hover:bg-cyan-400 transition-colors">Request Live Performance Reports</a>
          <a href="/dashboard/contact" className="border border-cyan-400/70 text-cyan-200 rounded-md px-4 py-2.5 text-sm font-medium hover:bg-cyan-500/10 transition-colors">Contact Us</a>
        </div>
        <div className="mt-6 md:mt-8 grid gap-4 md:gap-5 text-sm text-slate-300 md:grid-cols-2">
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-4 md:p-5 md:col-span-2">
            <p className="text-cyan-100 font-medium">Portfolio Composition</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-slate-100 font-medium">Directional Strategies (3)</p>
                <p className="mt-1 leading-relaxed">Trend-based setups (Bullish / Bearish moves capture)</p>
              </div>
              <div>
                <p className="text-slate-100 font-medium">Non-Directional Strategy (1)</p>
                <p className="mt-1 leading-relaxed">Range-bound / premium decay based strategy</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 md:p-5">
            <p className="text-slate-100 font-medium">Directional Strategies (3)</p>
            <p className="mt-2 leading-relaxed">Trend-following setups designed to capture bullish and bearish swings.</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 md:p-5">
            <p className="text-slate-100 font-medium">Risk Management Framework</p>
            <p className="mt-2 leading-relaxed">Maximum loss per day is capped at ~1% of deployed capital.</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 md:p-6 md:col-span-2">
            <p className="text-slate-100 font-medium">Capital Requirement</p>
            <p className="mt-3 leading-relaxed">• Minimum Capital to Start: ₹2,00,000 (with complete hedge coverage)</p>
            <p className="mt-2 leading-relaxed">• Ideal Capital for Full Portfolio: ₹6,00,000 (with complete hedge coverage)</p>
            <p className="mt-4 leading-relaxed">You can start with lower capital by deploying selected strategies and gradually scale to the full portfolio for improved risk distribution and smoother performance.</p>
          </div>
        </div>
      </section>

    </div>
  );
}

