'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { reportsBase, reportPrice, rupees, type ReportSettings } from '@/lib/backtest-reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText } from 'lucide-react';

const backtestPdfs = [
  {
    title: '₹5 LAKH | INTRADAY + STBT – STARTER',
    fileName: 'starter-5-lakh-2026-10-28.pdf',
  },
  {
    title: '₹10 LAKH | INTRADAY + STBT – STANDARD',
    fileName: 'standard-10-lakh-2026-10-28.pdf',
  },
  {
    title: '₹15 LAKH | INTRADAY + STBT – ADVANCED',
    fileName: 'advanced-15-lakh-2026-10-28.pdf',
  },
] as const;

export default function BacktestReportClient() {
  const [reports, setReports] = useState<ReportSettings[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch(reportsBase, { cache: 'no-store' }).then(async response => { if (!response.ok) throw new Error(); setReports(await response.json()); }).catch(() => setError(true)); }, []);
  const whatsapp = (index: number, proof = false) => {
    const report = reports.find(item => item.id === index + 1);
    const message = proof
      ? `Hello, I have paid for ${backtestPdfs[index].title}${report ? ` (${rupees(reportPrice(report))})` : ''}. I will attach my payment proof here.`
      : `Hello, I have a question about ${backtestPdfs[index].title}. Please share what is included and how it is delivered.`;
    return `https://wa.me/919977642137?text=${encodeURIComponent(message)}`;
  };
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
          <p className="text-sm md:text-base text-slate-300">Explore the backtest reports and ask our team about the available strategy packages.</p>
          <p className="text-sm text-slate-300">Reports are free to view. Contact our team for details of what is included in each paid package.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Focus</p>
            <p className="mt-1 text-sm text-slate-200">NIFTY &amp; SENSEX intraday expiry strategies.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Use Case</p>
            <p className="mt-1 text-sm text-slate-200">Analyze risk, consistency, and capital performance.</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Format</p>
            <p className="mt-1 text-sm text-slate-200">Concise PDF reports for easy sharing and review.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {backtestPdfs.map((pdf, index) => {
            const report = reports.find(item => item.id === index + 1);
            const href = report?.hasPdf ? `${reportsBase}/${report.id}/pdf` : `/backtest/${pdf.fileName}`;

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
                  {report ? <div className="pb-2">
                    <p className="text-xl font-semibold text-white">{rupees(reportPrice(report))}</p>
                    {report.discount > 0 && <p className="text-sm text-slate-300"><span className="line-through">{rupees(report.price)}</span> · {report.discount}% off</p>}
                  </div> : <p className="pb-2 text-sm text-slate-300">{error ? 'Price unavailable. Please try again later.' : 'Loading price…'}</p>}
                  <Button disabled={!report} onClick={() => setSelected(index)} className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">Purchase</Button>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full border-slate-600 bg-slate-800/60 text-slate-100 hover:bg-slate-700">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </a>
                  <a href={whatsapp(index)} target="_blank" rel="noopener noreferrer" className="block rounded-md px-2 py-2 text-center text-sm font-medium text-cyan-300 underline underline-offset-4">Ask about this package</a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-slate-900 text-slate-100 border-slate-700">
          <DialogHeader><DialogTitle>Purchase {selected !== null ? backtestPdfs[selected].title : ''}</DialogTitle><DialogDescription className="text-slate-300">Amount to pay: {selected !== null && reports[selected] ? rupees(reportPrice(reports[selected])) : ''}.</DialogDescription></DialogHeader>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-200"><li>Scan the QR code with your UPI app and check the recipient before paying.</li><li>Send your payment proof to our team on WhatsApp.</li><li>Our team will confirm your payment and proceed with the backtest strategies.</li></ol>
          <img src="/backtest/payment-qr.jpg" alt="Payment QR code for UPI ID anubhavsingh2901@axl" className="mx-auto w-full max-w-[300px] rounded-lg" />
          <p className="text-sm leading-relaxed text-slate-200">Using the same phone? Save the QR image and open it in a UPI app that supports scanning from your gallery, or ask our team for payment help. Payment is confirmed by our team, not automatically.</p>
          {selected !== null && <a className="font-semibold text-cyan-300 underline" href={whatsapp(selected, true)} target="_blank" rel="noopener noreferrer">Send payment proof to +91 99776 42137 on WhatsApp</a>}
        </DialogContent>
      </Dialog>

      <section className="mt-6 md:mt-10 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-6 md:p-10 shadow-[0_0_55px_-18px_rgba(34,211,238,0.5)]">
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Built for serious traders and investors</h3>
          <p className="text-slate-300 text-sm md:text-base">
            Contact our team for live performance information, strategy details, and help choosing a package.
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
            <p className="text-slate-100 font-medium">Risk Management Framework</p>
            <p className="mt-2 leading-relaxed">Backtests use historical data and do not guarantee future results. Live trading can result in losses, including losses beyond a planned limit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
