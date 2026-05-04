'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink, FileText } from 'lucide-react';

const backtestPdfs = [
  {
    title: 'NIFTY + SENSEX 0DTE',
    fileName: 'backtest_portfolio_NIFTY_&_SENSEX_INTRADAY_EXPIRY_STRATEGIES_0DTE.pdf',
  },
  {
    title: 'NIFTY 0DTE (May 2026)',
    fileName: 'backtest_portfolio_NIFTY_INTRADAY_EXPIRY_STRATEGIES_0DTE_2026_05 (1) (1).pdf',
  },
  {
    title: 'SENSEX 0DTE (May 2026)',
    fileName: 'backtest_portfolio_SENSEX_INTRADAY_EXPIRY_STRATEGIES_0DTE_2026_05 (1).pdf',
  },
] as const;

export default function BacktestReportClient() {
  return (
    <div id="backtest-report-root" className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/*
        Previous interactive backtest report sections were intentionally commented/removed.
        Per request, only the final Contact Us section is retained below, and the page now
        serves maintainable PDF download links from /public/backtest.
      */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Backtest PDFs</h1>
          <p className="text-sm md:text-base text-slate-300">Verified strategy reports for 0DTE index options.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Focus</p>
            <p className="mt-1 text-sm text-slate-200">NIFTY and SENSEX intraday expiry setups.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Use Case</p>
            <p className="mt-1 text-sm text-slate-200">Review risk, consistency, and capital behavior.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Format</p>
            <p className="mt-1 text-sm text-slate-200">Simple PDF docs for quick sharing and updates.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {backtestPdfs.map((pdf) => {
            const href = `/backtest/${pdf.fileName}`;

            return (
              <Card key={pdf.fileName} className="border-slate-700 bg-slate-900/70">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base leading-snug text-slate-100">{pdf.title}</CardTitle>
                  <CardDescription className="text-slate-400">PDF Report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full border-slate-600 bg-slate-800/60 text-slate-100 hover:bg-slate-700">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                  </a>
                  <a href={href} download className="block">
                    <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
