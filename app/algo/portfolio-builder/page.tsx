'use client';

import React, { useState } from 'react';

export default function PortfolioBuilderPage() {
  const [capital, setCapital] = useState<number>(1000000);
  const [ddLimit, setDdLimit] = useState<number>(15);
  const [targetRoi, setTargetRoi] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<'auto' | 'custom'>('auto');

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Portfolio Builder
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/20">
              Tool
            </span>
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Design algorithmically optimized portfolios tailored precisely to your capital, risk appetite, and strategic preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* left panel - inputs */}
          <div className="xl:col-span-4 space-y-6">
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button 
                onClick={() => setActiveTab('auto')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'auto' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Auto Generate
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'custom' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Custom Build
              </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Capital</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                  <input 
                    type="number" 
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max DD Limit (%)</label>
                  <input 
                    type="number" 
                    value={ddLimit}
                    onChange={(e) => setDdLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Annual ROI (%)</label>
                  <input 
                    type="number" 
                    value={targetRoi}
                    onChange={(e) => setTargetRoi(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="bg-slate-800 text-white rounded-lg py-2 text-xs font-bold border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]">Balanced</button>
                  <button className="bg-slate-950 text-slate-400 hover:bg-slate-800 rounded-lg py-2 text-xs font-bold border border-slate-800 transition">Aggressive</button>
                  <button className="bg-slate-950 text-slate-400 hover:bg-slate-800 rounded-lg py-2 text-xs font-bold border border-slate-800 transition">Conservative</button>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex justify-center items-center gap-2 mt-4">
                <span>⚡</span> Generate Portfolio
              </button>
            </div>
          </div>

          {/* right panel - results */}
          <div className="xl:col-span-8">
            <div className="h-full min-h-[600px] bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-graph-pattern relative overflow-hidden">
               {/* Pattern overlay */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
               
               <div className="relative z-10 p-6 bg-slate-950/80 backdrop-blur-sm rounded-2xl border border-slate-800 max-w-md">
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-xl">
                   <div className="text-3xl">🏗️</div>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Builder Ready</h3>
                 <p className="text-slate-400 text-sm">
                   Set your capital and risk limits on the left and click Generate to see the algorithmically created portfolio here.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
