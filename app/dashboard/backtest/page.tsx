import BacktestReportClient from '@/components/algo/backtest/BacktestReportClient';

export const metadata = {
  title: 'Backtest Report — NIFTY 0 DTE | MyTradeJournal',
  description: 'Backtest results for NIFTY 0 DTE Non Directional Strategy — cumulative PnL, drawdown, year-wise returns, and detailed statistics.',
};

export default function BacktestReportPage() {
  return <BacktestReportClient />;
}
