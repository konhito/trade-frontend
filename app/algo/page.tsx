import { getAlgoData } from '@/lib/algo-data-fetcher';
import AlgoDashboardClient from './AlgoDashboardClient';

export default async function AlgoDashboardPage() {
  const data = await getAlgoData();

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Algo Analytics
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold uppercase tracking-wider border border-rose-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                Live
              </span>
            </h1>
            <p className="text-slate-400 mt-1">Daily · Monthly · Yearly · Strategy Insights</p>
          </div>
        </header>

        <AlgoDashboardClient initialData={data} />
      </div>
    </div>
  );
}
