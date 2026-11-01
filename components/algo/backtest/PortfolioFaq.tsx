'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import groups from './portfolio-faq.json';
import styles from './PortfolioFaq.module.css';

export default function PortfolioFaq() {
  return (
    <section aria-labelledby="portfolio-faq-title" className={`${styles.faq} rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8`}>
      <h2 id="portfolio-faq-title" className="text-2xl font-semibold tracking-tight text-slate-100">Portfolio – Frequently Asked Questions (FAQ)</h2>
      <p className="mt-2 text-sm text-slate-300">₹5 Lakh | ₹10 Lakh | ₹15 Lakh Portfolios</p>
      <Accordion type="single" collapsible className="mt-8 space-y-8">
        {groups.map(group => (
          <div key={group.title}>
            <h3 className="mb-2 text-lg font-semibold text-cyan-200">{group.title}</h3>
            {group.items.map(item => (
              <AccordionItem key={item.id} value={`question-${item.id}`} className="border-slate-700">
                <AccordionTrigger className="gap-4 rounded-sm text-left text-base text-slate-100 hover:text-cyan-200 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 motion-reduce:[&>svg]:transition-none">
                  {`Q${item.id}. ${item.question}`}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-slate-300">
                  <div className="max-w-[75ch] space-y-3">
                    {item.answer.split(/\n\n+/).map((paragraph, index) => paragraph.includes('\t') ? (
                      <div key={index} className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead><tr>{paragraph.split('\n')[0].split('\t').map(cell => <th key={cell} scope="col" className="border-b border-slate-700 py-2 pr-4 font-medium text-slate-100">{cell}</th>)}</tr></thead>
                          <tbody>{paragraph.split('\n').slice(1).map(row => <tr key={row}>{row.split('\t').map(cell => <td key={cell} className="py-2 pr-4">{cell}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    ) : <p key={index} className="whitespace-pre-line">{paragraph}</p>)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        ))}
      </Accordion>
      <section aria-labelledby="portfolio-options-title" className="mt-10 border-t border-slate-700 pt-8">
        <h3 id="portfolio-options-title" className="text-xl font-semibold text-slate-100">Two Available Portfolio Options</h3>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-cyan-200">OPTION 1</h4>
            <p className="mt-2 font-medium text-slate-100">Strategy Purchase – One-Time Payment</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-300">
              <li>Complete strategy export files.</li>
              <li>Full strategy logic and trading rules.</li>
              <li>Deploy strategies on your own AlgoTest account.</li>
              <li>Complete execution settings and deployment guidance.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cyan-200">OPTION 2</h4>
            <p className="mt-2 font-medium text-slate-100">Monthly Profit Sharing – 30%</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-300">
              <li>No need to purchase export files.</li>
              <li>Connect your broker account to my AlgoTest setup.</li>
              <li>All strategies managed and executed from my end.</li>
              <li>Share 30% of monthly Net Profit.</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 max-w-[75ch] text-sm leading-relaxed text-slate-300"><strong className="font-semibold text-slate-100">Important:</strong> All returns and drawdown figures are based on historical results or estimates, not guaranteed future performance. The 3% DD threshold is a risk-management action level, not a guaranteed maximum loss. Actual losses may exceed it due to gaps, slippage or execution issues.</p>
      </section>
    </section>
  );
}
