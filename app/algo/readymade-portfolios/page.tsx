'use client';

import React from 'react';

const TIERS = [
  { capital: 500000, label: '₹5 Lakhs', tag: 'Entry', ddLimit: 15, count: 2, roi: '+2.8%' },
  { capital: 1000000, label: '₹10 Lakhs', tag: 'Starter', ddLimit: 15, count: 3, roi: '+3.1%' },
  { capital: 1500000, label: '₹15 Lakhs', tag: 'Basic', ddLimit: 15, count: 4, roi: '+3.4%' },
  { capital: 2000000, label: '₹20 Lakhs', tag: 'Balanced', ddLimit: 15, count: 4, roi: '+3.6%' },
  { capital: 5000000, label: '₹50 Lakhs', tag: 'Premium', ddLimit: 15, count: 7, roi: '+4.2%' },
  { capital: 10000000, label: '₹1 Crore', tag: 'Flagship', ddLimit: 15, count: 9, roi: '+4.5%' },
];

export default function ReadymadePortfoliosPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Readymade Portfolios
            </h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Algorithmically optimized strategy combinations for every capital level — backed by live trading data.
            </p>
          </div>
          <div className="mt-6 md:mt-0 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
             <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
             <span className="text-sm font-semibold text-emerald-100">Live Data Sync Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <div key={i} className="group relative bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.2)] overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="text-8xl font-black">{i + 1}</div>
              </div>
              
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-500/20">
                  {tier.tag}
                </div>
                
                <h3 className="text-3xl font-extrabold text-white font-mono break-words mb-2">
                  {tier.label}
                </h3>
                
                <div className="flex gap-4 mt-8">
                  <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Avg ROI</div>
                    <div className="text-emerald-400 font-mono text-xl font-bold">{tier.roi}</div>
                  </div>
                  <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800/50 group-hover:border-slate-700 transition-colors">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Strategies</div>
                    <div className="text-white font-mono text-xl font-bold">{tier.count}</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-sm font-medium text-slate-400">
                  <span>Max Simulated DD:</span>
                  <span className="text-rose-400">{tier.ddLimit}%</span>
                </div>
                
                <button className="w-full mt-6 py-3.5 bg-slate-800 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all duration-300">
                  View Portfolio Details ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
