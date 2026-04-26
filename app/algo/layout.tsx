import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AlgoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-rose-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center">
              <Image src="/logo2.png" alt="MyTradeJournal Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-white">MyTradeJournal</div>
              <div className="text-xs text-emerald-400 font-semibold tracking-wider">ALGO LAB</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Analytics
          </div>
          <Link href="/algo" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors">
            <span>📅</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </div>
          <Link href="/algo/portfolio-builder" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors">
            <span>📦</span>
            <span className="text-sm font-medium">Portfolio Builder</span>
          </Link>
          <Link href="/algo/readymade-portfolios" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-300 hover:text-white transition-colors">
            <span>🏦</span>
            <span className="text-sm font-medium">Readymade Portfolios</span>
          </Link>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          MyTradeJournal &copy; {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:hidden border-b border-slate-800 bg-slate-950 flex items-center px-4 justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center">
              <Image src="/logo2.png" alt="MyTradeJournal Logo" width={32} height={32} className="object-contain" />
            </div>
            <div className="font-bold tracking-tight">MyTradeJournal</div>
          </div>
          <button className="p-2 -mr-2 text-slate-400">☰</button>
        </header>
        
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
