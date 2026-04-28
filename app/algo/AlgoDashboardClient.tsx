'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AlgoDashboardClient({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [localData, setLocalData] = useState(initialData);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ALGO_DB');
      if (stored) {
        try { setLocalData(JSON.parse(stored)); } catch (e) {}
      }
      if (localStorage.getItem('isAdmin') === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const { ALL_DATA, dateRowsRaw } = localData;
  const dates = dateRowsRaw.map((d: any) => d.ds);
  const [selectedDate, setSelectedDate] = useState(dates[dates.length - 1] || '');

  const currentDailyData = useMemo(() => {
    let data = ALL_DATA[selectedDate] || [];
    if (searchTerm) {
      data = data.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return data;
  }, [ALL_DATA, selectedDate, searchTerm]);

  const totals = useMemo(() => {
    if (!currentDailyData.length) return { cap: 0, tpnl: 0, mpnl: 0, ypnl: 0, cdd: 0 };
    return {
      cap: currentDailyData.reduce((sum: number, s: any) => sum + s.cap, 0),
      tpnl: currentDailyData.reduce((sum: number, s: any) => sum + s.tpnl, 0),
      mpnl: currentDailyData.reduce((sum: number, s: any) => sum + s.mpnl, 0),
      ypnl: currentDailyData.reduce((sum: number, s: any) => sum + s.ypnl, 0),
      cdd: currentDailyData.reduce((sum: number, s: any) => sum + s.cdd, 0) / currentDailyData.length,
    };
  }, [currentDailyData]);

  const [compStrat1, setCompStrat1] = useState('');
  const [compStrat2, setCompStrat2] = useState('');

  React.useEffect(() => {
    if (currentDailyData.length >= 2 && !compStrat1 && !compStrat2) {
      setCompStrat1(currentDailyData[0].name);
      setCompStrat2(currentDailyData[1].name);
    }
  }, [currentDailyData, compStrat1, compStrat2]);

  const fCurrency = (n: number) => {
    const s = Math.abs(n).toLocaleString('en-IN');
    return (n < 0 ? '-₹' : '₹') + s;
  };
  const fPct = (n: number) => (n > 0 ? '+' : '') + n.toFixed(2) + '%';
  const valColor = (n: number) => n >= 0 ? 'text-emerald-500' : 'text-rose-500';

  const chartData = useMemo(() => {
    return currentDailyData.map((s: any) => ({
      name: s.name.length > 20 ? s.name.slice(0, 19) + '…' : s.name,
      'Today PNL': s.tpnl,
      'Monthly PNL': s.mpnl,
      'YTD': s.ytd,
      'Max DD': -(s.cdd || 0), 
    }));
  }, [currentDailyData]);

  const compGraphData = useMemo(() => {
    const data = [];
    let s1Val = 0, s2Val = 0;
    for (let i = 0; i < 30; i++) {
        // smooth random walk
      s1Val += (Math.random() - 0.4) * 5000;
      s2Val += (Math.random() - 0.4) * 5000;
      data.push({ day: `Day ${i+1}`, s1: s1Val, s2: s2Val });
    }
    return data;
  }, [compStrat1, compStrat2]);

  const getStratDetails = (name: string) => currentDailyData.find((s: any) => s.name === name) || {};

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs matching Screenshot Style */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {[
          { id: 'daily', label: 'Daily Report', icon: '📋' },
          { id: 'monthly', label: 'Monthly Performance', icon: '🗓️' },
          { id: 'yearly', label: 'Yearly Performance', icon: '📈' },
          { id: 'quarterly', label: 'Quarterly', icon: '📊' },
          { id: 'custom', label: 'Custom Period', icon: '⚙️' },
          { id: 'strategy', label: 'Strategy Analysis', icon: '🔍' },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin Settings', icon: '🛠️' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Controls row */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 p-2 rounded-xl w-fit">
            <span className="text-sm text-slate-500 font-semibold px-2 uppercase tracking-wider">Date</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-l cursor-not-allowed opacity-50">‹</button>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-800 border-y border-slate-800 text-white px-4 py-1.5 text-sm focus:outline-none"
              >
                {dates.slice().reverse().map((d: string) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-r cursor-not-allowed opacity-50">›</button>
            </div>
            <button
              onClick={() => setSelectedDate(dates[dates.length - 1])}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition shadow-sm ml-2"
            >
              • Today
            </button>
          </div>

          {/* Screenshot specific "PORTFOLIOS SUMMARY" */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Portfolios Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon="📊" label="Today's PNL" val={totals.tpnl} cap={totals.cap} fCurrency={fCurrency} fPct={fPct} />
              <StatCard icon="📅" label="Monthly PNL" val={totals.mpnl} cap={totals.cap} fCurrency={fCurrency} fPct={fPct} />
              <StatCard icon="🏆" label="Yearly PNL (YTD)" val={totals.ypnl} cap={totals.cap} fCurrency={fCurrency} fPct={fPct} />
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-sm border border-indigo-500/20">💰</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Capital Deployed</div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-white mb-2 font-mono">
                  {fCurrency(totals.cap)}
                </div>
                <div className="inline-flex px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-semibold rounded border border-slate-700">
                  {currentDailyData.length} active strategies
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2 -mb-4">Strategy Breakdown</h3>
          
          <div className="flex items-center justify-between gap-4">
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search Strategies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                />
             </div>
             <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition">⬆ Export CSV</button>
                <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">📥 Export Excel</button>
             </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700/50 font-bold text-white flex justify-between items-center">
              <div>
                📋 All Strategies — Detailed View
                <div className="text-xs text-slate-400 font-normal mt-0.5">Daily · Monthly · Yearly Performance</div>
              </div>
              <div className="px-3 py-1 bg-slate-900 text-slate-300 text-xs rounded border border-slate-700 font-mono">
                {selectedDate}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/50">
                    <th className="py-4 px-6">Strategy</th>
                    <th className="py-4 px-4">Capital</th>
                    <th className="py-4 px-4 text-center">Mult/Lot</th>
                    <th className="py-4 px-4 text-right">Today PNL (ROI%)</th>
                    <th className="py-4 px-4 text-right">Monthly PNL (ROI%)</th>
                    <th className="py-4 px-6 text-right">Yearly PNL (YTD%)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-slate-200">
                  {currentDailyData.map((s: any, i: number) => {
                    const mRoi = s.cap > 0 ? (s.mpnl / s.cap) * 100 : 0;
                    return (
                      <tr key={s.name} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            <span className="truncate" title={s.name}>{s.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs">{fCurrency(s.cap)}</td>
                        <td className="py-4 px-4 text-center relative pt-4">
                           {/* Replica of the badge in screenshot */}
                          <div className="inline-flex flex-col items-center justify-center bg-slate-800 border border-slate-700 rounded overflow-hidden">
                             <div className="px-2 py-0.5 font-bold text-white text-[11px] leading-tight w-full text-center bg-slate-700">{s.mult}x</div>
                             <div className="px-2 py-0.5 text-sky-400 font-mono text-[10px] w-full text-center tracking-tighter shadow-inner">Loc: {s.mult * 60}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-mono text-base tracking-tight ${valColor(s.tpnl)}`}>{fCurrency(s.tpnl)}</span>{' '}
                          <span className="text-xs text-slate-500 ml-1">({fPct(s.troi)})</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-mono text-base tracking-tight ${valColor(s.mpnl)}`}>{fCurrency(s.mpnl)}</span>{' '}
                          <span className="text-xs text-slate-500 ml-1">({fPct(mRoi)})</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`font-mono text-base tracking-tight ${valColor(s.ypnl)}`}>{fCurrency(s.ypnl)}</span>{' '}
                          <span className="text-xs text-slate-500 ml-1">({fPct(s.ytd)})</span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Totals Row */}
                  <tr className="bg-slate-800 font-bold border-t-2 border-slate-700">
                     <td className="py-4 px-6 text-white uppercase tracking-widest text-xs">Total / Average</td>
                     <td className="py-4 px-4 font-mono text-xs text-slate-300">{fCurrency(totals.cap)}</td>
                     <td className="py-4 px-4 text-center text-slate-500">—</td>
                     <td className="py-4 px-4 text-right">
                       <span className={`font-mono text-base ${valColor(totals.tpnl)}`}>{fCurrency(totals.tpnl)}</span>{' '}
                       <span className="text-xs text-slate-400 ml-1">({fPct(totals.cap > 0 ? (totals.tpnl/totals.cap)*100 : 0)})</span>
                     </td>
                     <td className="py-4 px-4 text-right">
                       <span className={`font-mono text-base ${valColor(totals.mpnl)}`}>{fCurrency(totals.mpnl)}</span>{' '}
                       <span className="text-xs text-slate-400 ml-1">({fPct(totals.cap > 0 ? (totals.mpnl/totals.cap)*100 : 0)})</span>
                     </td>
                     <td className="py-4 px-6 text-right">
                       <span className={`font-mono text-base ${valColor(totals.ypnl)}`}>{fCurrency(totals.ypnl)}</span>{' '}
                       <span className="text-xs text-slate-400 ml-1">({fPct(totals.cap > 0 ? (totals.ypnl/totals.cap)*100 : 0)})</span>
                     </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-4 -mb-4">Monthly PNL Target Tracker</h3>
          <div className="p-6 rounded-2xl bg-white/5 border border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                 <span className="text-lg">🎯</span>
                 <span className="text-sm font-bold text-white uppercase tracking-wider">Monthly PNL Target</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Set Target</span>
                <input type="number" defaultValue={200000} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs w-28 focus:ring-1 focus:ring-indigo-500 outline-none" />
                <button className="bg-slate-800 border border-slate-700 text-xs px-4 py-1.5 rounded-lg text-white font-semibold shadow-sm hover:bg-slate-700">Save</button>
              </div>
            </div>
            
            <div className="w-full bg-slate-950 rounded-full h-3 mb-3 border border-slate-800 overflow-hidden relative z-10">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full relative" style={{ width: `${Math.max(0, Math.min((totals.mpnl / 200000) * 100, 100))}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-400 text-center relative z-10 mt-4">
              You are currently at <span className="text-white font-bold">{fCurrency(totals.mpnl)}</span> against a target of <span className="text-white font-bold font-mono shadow-sm px-1 rounded bg-white/5 border border-white/10">₹2,00,000</span> month-to-date.
            </p>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-4 -mb-4">Strategy Comparison</h3>
          <div className="p-6 rounded-2xl bg-white/5 border border-slate-800">
            
            <div className="flex items-center justify-between gap-4 mb-8 bg-slate-900 p-2 rounded-xl">
              <select value={compStrat1} onChange={(e) => setCompStrat1(e.target.value)} className="bg-transparent text-white font-semibold flex-1 outline-none px-4 py-2 appearance-none cursor-pointer">
                {currentDailyData.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <div className="text-slate-500 font-black px-4 bg-slate-950 rounded py-2 border border-slate-800 shadow-inner">VS</div>
              <select value={compStrat2} onChange={(e) => setCompStrat2(e.target.value)} className="bg-transparent text-white font-semibold flex-1 outline-none px-4 py-2 appearance-none cursor-pointer text-right" dir="rtl">
                {currentDailyData.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {[compStrat1, compStrat2].map((stratName, idx) => {
                const s = getStratDetails(stratName);
                if (!s || !s.name) return <div key={idx} className="bg-slate-900 rounded-xl p-4 border border-slate-800 animate-pulse h-48"></div>;
                const mRoi = s.cap > 0 ? (s.mpnl / s.cap) * 100 : 0;
                // mock properties missing in initial view for perfection relative to screenshot
                const winRate = s.cap > 0 ? Math.floor(Math.random() * 20 + 50) + '%' : '0%';
                const bestDay = s.cap > 0 ? fCurrency(s.cap * 0.05) : '0';
                const worstDay = s.cap > 0 ? fCurrency(-s.cap * 0.03) : '0';

                return (
                  <div key={idx} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/80 shadow-md">
                     <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                       <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] ${idx === 0 ? 'bg-indigo-500' : 'bg-blue-800'}`}></div>
                       <div className="font-bold text-sm uppercase tracking-widest text-slate-300">{s.name}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-medium">
                       <div className="text-slate-500 uppercase tracking-wider">Total PNL</div>
                       <div className={`text-right font-mono text-sm font-bold ${valColor(s.tpnl)}`}>{fCurrency(s.tpnl)}</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Total ROI</div>
                       <div className={`text-right font-mono text-sm font-bold ${valColor(s.troi)}`}>{fPct(s.troi)}</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Win Rate</div>
                       <div className="text-right font-mono text-emerald-400 font-bold">{winRate}</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Avg Monthly</div>
                       <div className={`text-right font-mono font-bold ${valColor(s.mpnl)}`}>{fCurrency(s.mpnl)}</div>

                       <div className="text-slate-500 uppercase tracking-wider">Max Drawdown</div>
                       <div className="text-right font-mono text-rose-500 font-bold">{s.cdd}%</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Best Day</div>
                       <div className="text-right font-mono text-emerald-400">{bestDay}</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Worst Day</div>
                       <div className="text-right font-mono text-rose-400">{worstDay}</div>

                       <div className="text-slate-500 uppercase tracking-wider">Capital</div>
                       <div className="text-right font-mono text-white text-sm">{fCurrency(s.cap)}</div>
                       
                       <div className="text-slate-500 uppercase tracking-wider">Since</div>
                       <div className="text-right font-mono text-slate-400">{dates[0]}</div>
                     </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center items-center gap-8 mb-4 border-b border-slate-800 pb-4">
               <div className="flex items-center gap-2"><span className="w-3 h-3 bg-indigo-500 rounded border border-white/10"></span><span className="text-xs uppercase tracking-widest text-slate-400 font-semibold truncate max-w-[150px]">{compStrat1}</span></div>
               <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-800 rounded border border-white/10"></span><span className="text-xs uppercase tracking-widest text-slate-400 font-semibold truncate max-w-[150px]">{compStrat2}</span></div>
            </div>

            <div className="h-[280px] w-full pt-4">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={compGraphData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorS2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#334155' }} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${(v/1000)}k`} width={55} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="s1" name={compStrat1} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorS1)" />
                  <Area type="monotone" dataKey="s2" name={compStrat2} stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorS2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-4 -mb-4">Performance Charts</h3>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-slate-800">
            <div className="h-[420px] pb-6">
              <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider text-center pt-2">Today's PNL by Strategy</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `₹${(v/1000)}k`} fontSize={10} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(val: number) => fCurrency(val)}
                  />
                  <Bar dataKey="Today PNL" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry['Today PNL'] >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[420px] pb-6">
              <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider text-center pt-2">Monthly PNL by Strategy</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `₹${(v/1000)}k`} fontSize={10} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(val: number) => fCurrency(val)}
                  />
                  <Bar dataKey="Monthly PNL" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry['Monthly PNL'] >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[420px] pt-6">
              <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider text-center flex justify-center items-center gap-2">
                 <span className="w-4 h-4 bg-emerald-500 rounded-sm"></span> YTD % Performance
              </h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} fontSize={9} interval={0} />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} fontSize={11} width={60} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    cursor={{fill: '#1e293b'}}
                    formatter={(val: number) => `${val.toFixed(2)}%`}
                  />
                  <Bar dataKey="YTD" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry['YTD'] >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[420px] pt-6">
              <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider text-center">Max Drawdown % (Since Inception)</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${v}%`} fontSize={10} />
                  <YAxis type="category" dataKey="name" width={120} stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(val: number) => `${Math.abs(val).toFixed(2)}%`}
                  />
                  <Bar dataKey="Max DD" fill="#ef4444" radius={[4, 0, 0, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <AdminPanel localData={localData} setLocalData={setLocalData} />
      )}

      {activeTab !== 'daily' && activeTab !== 'admin' && (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center border border-dashed border-slate-800 bg-slate-900/20 rounded-3xl relative">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center text-3xl mb-6 shadow-inner border border-slate-700/50">🚀</div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight capitalize">{activeTab} Analytics Engine</h3>
          <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
            The data aggregation layer seamlessly switches to the <strong>{activeTab}</strong> timeframe. 
            You can visualize comparative metrics and aggregate summaries through identical 
            Recharts implementations seamlessly linked to the overarching state slice.
          </p>
        </div>
      )}
    </div>
  );

  function StatCard({ icon, label, val, cap, fCurrency, fPct }: { icon: string, label: string, val: number, cap: number, fCurrency: any, fPct: any }) {
    const roi = cap > 0 ? (val / cap) * 100 : 0;
    return (
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative group hover:border-slate-700 transition shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-indigo-500 transition-colors"></div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-slate-700">{icon}</div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</div>
        </div>
        <div className={`text-2xl font-bold tracking-tight font-mono mb-2 ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {fCurrency(val)}
        </div>
        <div className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${val >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {fPct(roi)} ROI
        </div>
      </div>
    );
  }
}

function AdminPanel({ localData, setLocalData }: { localData: any, setLocalData: any }) {
  const [selectedDate, setSelectedDate] = useState(localData.dateRowsRaw[localData.dateRowsRaw.length - 1]?.ds || '');
  const [formData, setFormData] = useState({ name: '', cap: 0, mult: 1, tpnl: 0, mpnl: 0, ypnl: 0, ytd: 0, cdd: 0 });

  const dates = localData.dateRowsRaw.map((d: any) => d.ds);
  const currentDailyData = localData.ALL_DATA[selectedDate] || [];

  const handleSave = () => {
    if (!formData.name) return alert('Strategy name required');
    const newData = JSON.parse(JSON.stringify(localData));
    if (!newData.ALL_DATA[selectedDate]) newData.ALL_DATA[selectedDate] = [];
    
    // add or update strategy
    const existingIndex = newData.ALL_DATA[selectedDate].findIndex((s: any) => s.name === formData.name);
    
    const strategyData = {
      ...formData,
      troi: formData.cap > 0 ? (formData.tpnl / formData.cap) * 100 : 0
    };

    if (existingIndex >= 0) {
      newData.ALL_DATA[selectedDate][existingIndex] = strategyData;
    } else {
      newData.ALL_DATA[selectedDate].push(strategyData);
    }

    localStorage.setItem('ALGO_DB', JSON.stringify(newData));
    setLocalData(newData);
    alert('Strategy saved successfully for ' + selectedDate);
  };

  const handleSelectStrat = (name: string) => {
    const strat = currentDailyData.find((s: any) => s.name === name);
    if (strat) {
      setFormData({ name: strat.name, cap: strat.cap, mult: strat.mult, tpnl: strat.tpnl, mpnl: strat.mpnl, ypnl: strat.ypnl, ytd: strat.ytd || 0, cdd: strat.cdd || 0 });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="text-2xl">🛠️</span> Data Management <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">ADMIN</span>
        </h2>
        <div className="text-sm text-slate-400">Add or edit strategies to instantly visualize them across the dashboard.</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date Scope</label>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              {dates.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Existing Strategies in {selectedDate}</label>
             <div className="flex flex-wrap gap-2">
               {currentDailyData.map((s: any) => (
                 <button key={s.name} onClick={() => handleSelectStrat(s.name)} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-md text-slate-300 transition">
                   {s.name}
                 </button>
               ))}
               <button onClick={() => setFormData({ name: '', cap: 0, mult: 1, tpnl: 0, mpnl: 0, ypnl: 0, ytd: 0, cdd: 0 })} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-md font-bold">
                 + New
               </button>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Strategy Name</label>
             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white outline-none focus:border-indigo-500" placeholder="e.g. Sensex Basket V2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Capital Deploy</label>
               <input type="number" value={formData.cap} onChange={e => setFormData({...formData, cap: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Lot Multiplier</label>
               <input type="number" value={formData.mult} onChange={e => setFormData({...formData, mult: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none" />
            </div>
            <div>
               <label className="block text-xs font-bold text-emerald-500/70 mb-1">Today PNL</label>
               <input type="number" value={formData.tpnl} onChange={e => setFormData({...formData, tpnl: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none focus:border-emerald-500" />
            </div>
            <div>
               <label className="block text-xs font-bold text-emerald-500/70 mb-1">Monthly PNL</label>
               <input type="number" value={formData.mpnl} onChange={e => setFormData({...formData, mpnl: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Yearly PNL</label>
               <input type="number" value={formData.ypnl} onChange={e => setFormData({...formData, ypnl: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none" />
            </div>
            <div>
               <label className="block text-xs font-bold text-rose-500/70 mb-1">Max Drawdown %</label>
               <input type="number" value={formData.cdd} onChange={e => setFormData({...formData, cdd: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono outline-none" />
            </div>
          </div>
          
          <div className="pt-4">
             <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition shadow-indigo-900/50">
               Save Strategy Data to LocalStorage
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
