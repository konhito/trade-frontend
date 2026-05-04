import BacktestReportClient from '@/components/algo/backtest/BacktestReportClient';

export const metadata = {
  title: 'Backtest Report | MyTradeJournal',
  description: 'Backtest results with cumulative PnL, drawdown, year-wise returns, and detailed statistics.',
};

export default function BacktestReportPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      <BacktestReportClient />
    </div>
  );
}
