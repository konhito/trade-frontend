import { Trade } from "@/lib/types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { formatInTimeZone } from 'date-fns-tz'
import { StatisticsProps } from "@/app/[locale]/dashboard/types/statistics"
import { Account } from "@/context/data-provider"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePositionTime(timeInSeconds: number): string {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutesLeft = Math.floor((timeInSeconds - (hours * 3600)) / 60);
  const secondsLeft = Math.floor(timeInSeconds - (hours * 3600) - (minutesLeft * 60));
  
  if (isNaN(hours) || isNaN(minutesLeft) || isNaN(secondsLeft)) {
    return '0';
  }
  
  const formattedTime = [
    hours > 0 ? `${hours}h` : '',
    `${minutesLeft}m`,
    `${secondsLeft}s`
  ].filter(Boolean).join(' ');
  
  return formattedTime;
}

export function calculateStatistics(trades: Trade[], accounts: Account[] = [], strategies: any[] = []): StatisticsProps {
  // Helper function to parse numeric values
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (!value) return 0
    const str = String(value).replace(/[^0-9.+-]/g, '')
    const num = Number(str)
    return Number.isFinite(num) ? num : 0
  }

  const initialStatistics: StatisticsProps = {
    cumulativeFees: 0,
    cumulativePnl: 0,
    winningStreak: 0,
    winRate: 0,
    nbTrades: 0,
    nbBe: 0,
    nbWin: 0,
    nbLoss: 0,
    totalPositionTime: 0,
    averagePositionTime: '0s',
    profitFactor: 1,
    grossLosses: 0,
    grossWin: 0,
    totalPayouts: 0,
    nbPayouts: 0,
  };

  // Process trades first
  if (trades.length > 0) {
    // Create a map of accounts for quick lookup
    const accountMap = new Map(accounts.map(account => [account.number, account]));

    // Filter trades based on reset dates for each account
    const filteredTrades = trades.filter(trade => {
      const account = accountMap.get(trade.accountNumber);
      if (!account || !account.resetDate) {
        return true; // Include trade if no account found or no reset date
      }
      // Only include trades that occurred after the reset date
      return new Date(trade.entryDate) >= new Date(account.resetDate);
    });

    // Process trades
    filteredTrades.forEach((trade: Trade) => {
      // Ensure P&L is properly parsed as a number (handles negative values correctly)
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : (trade.pnl !== undefined && trade.pnl !== null ? parseFloat(String(trade.pnl)) : 0)
      // Ensure commission is properly parsed as a number
      const commission = typeof trade.commission === 'number' ? trade.commission : (trade.commission !== undefined && trade.commission !== null ? parseFloat(String(trade.commission)) : 0)
      
      // Skip if P&L is invalid (NaN)
      if (isNaN(pnl)) {
        console.warn('[calculateStatistics] Invalid P&L value:', trade.pnl, 'for trade:', trade.id)
        return
      }
      
      initialStatistics.nbTrades++;
      initialStatistics.cumulativePnl += pnl;
      initialStatistics.cumulativeFees += commission;
      initialStatistics.totalPositionTime += trade.timeInPosition || 0;

      if (pnl === 0) {
        initialStatistics.nbBe++;
      } else if (pnl > 0) {
        initialStatistics.nbWin++;
        initialStatistics.winningStreak++;
        initialStatistics.grossWin += pnl;
      } else {
        initialStatistics.nbLoss++;
        initialStatistics.winningStreak = 0;
        initialStatistics.grossLosses += Math.abs(pnl);
      }
    });

    // Get unique account numbers from the filtered trades
    const tradeAccountNumbers = new Set(filteredTrades.map(trade => trade.accountNumber));
    
    // Calculate total payouts only from accounts that have trades in the current dataset
    accounts.forEach(account => {
      if (tradeAccountNumbers.has(account.number)) {
        const payouts = account.payouts || [];
        payouts.forEach(payout => {
          // Only include payouts that occurred after the reset date
          if (!account.resetDate || new Date(payout.date) >= new Date(account.resetDate)) {
            initialStatistics.totalPayouts += payout.amount;
            initialStatistics.nbPayouts++;
          }
        });
      }
    });
  }

  // Process strategies historical data
  if (strategies && strategies.length > 0) {
    strategies.forEach((strategy: any) => {
      if (!strategy.historicalData) return
      
      let historicalData = strategy.historicalData
      if (typeof historicalData === 'string') {
        try {
          historicalData = JSON.parse(historicalData)
        } catch {
          return
        }
      }
      
      if (historicalData && historicalData.entries && Array.isArray(historicalData.entries)) {
        historicalData.entries.forEach((entry: any) => {
          if (!entry.date || entry.live === undefined || entry.live === null) return
          
          const livePnL = parseNumeric(entry.live)
          
          // Skip if P&L is invalid (NaN)
          if (isNaN(livePnL)) return
          
          // Add strategy P&L to cumulative (no commission for strategies)
          initialStatistics.cumulativePnl += livePnL
          initialStatistics.nbTrades++
          
          if (livePnL === 0) {
            initialStatistics.nbBe++
          } else if (livePnL > 0) {
            initialStatistics.nbWin++
            initialStatistics.winningStreak++
            initialStatistics.grossWin += livePnL
          } else {
            initialStatistics.nbLoss++
            initialStatistics.winningStreak = 0
            initialStatistics.grossLosses += Math.abs(livePnL)
          }
        })
      }
    })
  }

  // Calculate win rate from all trades (trades + strategies)
  const totalTrades = initialStatistics.nbWin + initialStatistics.nbLoss
  initialStatistics.winRate = totalTrades > 0 ? (initialStatistics.nbWin / totalTrades) * 100 : 0

  // Calculate average position time (only for trades, not strategies)
  if (initialStatistics.nbTrades > 0) {
    const tradesOnly = trades.filter(t => {
      const account = accounts.find(a => a.number === t.accountNumber)
      if (!account || !account.resetDate) return true
      return new Date(t.entryDate) >= new Date(account.resetDate)
    }).length
    if (tradesOnly > 0) {
      const averageTimeInSeconds = Math.round(initialStatistics.totalPositionTime / tradesOnly)
      initialStatistics.averagePositionTime = parsePositionTime(averageTimeInSeconds)
    }
  }

  return initialStatistics
}

export function formatCalendarData(trades: Trade[], accounts: Account[] = []) {
  // Create a map of accounts for quick lookup
  const accountMap = new Map(accounts.map(account => [account.number, account]));

  // Filter trades based on reset dates for each account
  const filteredTrades = trades.filter(trade => {
    const account = accountMap.get(trade.accountNumber);
    if (!account || !account.resetDate) {
      return true; // Include trade if no account found or no reset date
    }
    
    // Only include trades that occurred after the reset date
    return new Date(trade.entryDate) >= new Date(account.resetDate);
  });

  const result = filteredTrades.reduce((acc: any, trade: Trade) => {
    // Parse the date and format it in UTC to ensure consistency across timezones
    const date = formatInTimeZone(new Date(trade.entryDate), 'UTC', 'yyyy-MM-dd')
    
    if (!acc[date]) {
      acc[date] = { 
        pnl: 0, 
        tradeNumber: 0, 
        longNumber: 0, 
        shortNumber: 0, 
        trades: [],
        strategies: new Set<string>()
      }
    }
    // Ensure P&L and commission are properly parsed as numbers (handles negative values correctly)
    const pnl = typeof trade.pnl === 'number' ? trade.pnl : (trade.pnl !== undefined && trade.pnl !== null ? parseFloat(String(trade.pnl)) : 0)
    const commission = typeof trade.commission === 'number' ? trade.commission : (trade.commission !== undefined && trade.commission !== null ? parseFloat(String(trade.commission)) : 0)
    
    // Skip if P&L is invalid (NaN)
    if (isNaN(pnl)) {
      return acc
    }
    
    acc[date].tradeNumber++
    acc[date].pnl += pnl - commission

    const isLong = trade.side 
      ? (trade.side.toLowerCase() === 'long' || trade.side.toLowerCase() === 'buy' || trade.side.toLowerCase() === 'b') 
      : (new Date(trade.entryDate).getTime() < new Date(trade.closeDate).getTime())
    
    acc[date].longNumber += isLong ? 1 : 0
    acc[date].shortNumber += isLong ? 0 : 1
    
    // Include strategy if available
    if (trade.strategy) {
      acc[date].strategies.add(trade.strategy)
    }
    
    acc[date].trades.push(trade)
    return acc
  }, {})

  // Convert Sets to arrays for serialization
  return Object.keys(result).reduce((acc: any, date: string) => {
    acc[date] = {
      ...result[date],
      strategies: Array.from(result[date].strategies)
    }
    return acc
  }, {})
}

export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key] as string] = result[currentValue[key] as string] || []).push(
      currentValue
    );
    return result;
  }, {} as { [key: string]: T[] });
}

export function calculateTradingDays(trades: Trade[], minPnlToCountAsDay?: number | null): {
  totalTradingDays: number;
  validTradingDays: number;
  dailyPnL: { [date: string]: number };
} {
  if (!trades.length) {
    return {
      totalTradingDays: 0,
      validTradingDays: 0,
      dailyPnL: {}
    };
  }

  // Group trades by date and calculate daily PnL
  const dailyPnL: { [date: string]: number } = {};
  
  trades.forEach(trade => {
    const tradeDate = new Date(trade.entryDate);
    const dateKey = tradeDate.toISOString().split('T')[0];
    
    if (!dailyPnL[dateKey]) {
      dailyPnL[dateKey] = 0;
    }
    
    // Calculate net PnL (including commission)
    dailyPnL[dateKey] += trade.pnl - (trade.commission || 0);
  });

  const totalTradingDays = Object.keys(dailyPnL).length;
  
  // Count valid trading days based on threshold
  let validTradingDays = totalTradingDays;
  
  if (minPnlToCountAsDay !== null && minPnlToCountAsDay !== undefined && minPnlToCountAsDay > 0) {
    validTradingDays = Object.values(dailyPnL).filter(dailyPnl => dailyPnl >= minPnlToCountAsDay).length;
  }

  return {
    totalTradingDays,
    validTradingDays,
    dailyPnL
  };
}

export function generateTradeHash(trade: Partial<Trade>): string {
  // Handle undefined values by converting them to empty strings or default values
  const hashString = `${trade.userId || ''}-${trade.accountNumber || ''}-${trade.instrument || ''}-${trade.entryDate || ''}-${trade.closeDate || ''}-${trade.quantity || 0}-${trade.entryId || ''}-${trade.closeId || ''}-${trade.timeInPosition || 0}`
  return hashString
}

// Period-based statistics types
export interface PeriodStatistics extends StatisticsProps {
  period: string; // Date, week key, or month key
  periodLabel: string; // Formatted label for display
}

export type PeriodType = 'daily' | 'weekly' | 'monthly';

// Helper to get week key (YYYY-WW format)
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Get Thursday (week starts on Monday)
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Helper to get month key (YYYY-MM format)
function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

// Helper to format period label
function formatPeriodLabel(period: string, periodType: PeriodType): string {
  if (periodType === 'daily') {
    try {
      return format(new Date(period), 'MMM dd, yyyy');
    } catch {
      return period;
    }
  } else if (periodType === 'weekly') {
    // Format: "Week 01, 2024" or "Jan 01 - Jan 07, 2024"
    const [year, week] = period.split('-W');
    if (!year || !week) return period;
    // Calculate start of week
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);
    const simple = new Date(yearNum, 0, 1 + (weekNum - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    const weekEnd = new Date(ISOweekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${format(ISOweekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
  } else {
    // Monthly: "January 2024"
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, 'MMMM yyyy');
    } catch {
      return period;
    }
  }
}

// Calculate period-based statistics
export function calculatePeriodStatistics(
  trades: Trade[],
  strategies: any[],
  accounts: Account[] = [],
  periodType: PeriodType = 'daily'
): PeriodStatistics[] {
  const parseNumeric = (value: any): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (!value) return 0;
    const str = String(value).replace(/[^0-9.+-]/g, '');
    const num = Number(str);
    return Number.isFinite(num) ? num : 0;
  };

  // Create account map for filtering
  const accountMap = new Map(accounts.map(account => [account.number, account]));

  // Group trades and strategies by period
  const periodMap = new Map<string, {
    trades: Trade[];
    strategyEntries: Array<{ date: Date; pnl: number }>;
  }>();

  // Process trades
  trades.forEach((trade: Trade) => {
    const account = accountMap.get(trade.accountNumber);
    if (account?.resetDate && new Date(trade.entryDate) < new Date(account.resetDate)) {
      return; // Skip trades before reset date
    }

    // Use exitDate/closeDate first (same as dashboard), then fallback to entryDate
    const tradeDate = (trade as any).closeDate 
      ? new Date((trade as any).closeDate) 
      : (trade.exitDate 
        ? new Date(trade.exitDate) 
        : (trade.entryDate ? new Date(trade.entryDate) : null));
    
    if (!tradeDate || isNaN(tradeDate.getTime())) return;

    let periodKey: string;
    if (periodType === 'daily') {
      periodKey = format(tradeDate, 'yyyy-MM-dd');
    } else if (periodType === 'weekly') {
      periodKey = getWeekKey(tradeDate);
    } else {
      periodKey = getMonthKey(tradeDate);
    }

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, { trades: [], strategyEntries: [] });
    }

    periodMap.get(periodKey)!.trades.push(trade);
  });

  // Process strategies
  if (strategies && strategies.length > 0) {
    strategies.forEach((strategy: any) => {
      if (!strategy.historicalData) return;

      let historicalData = strategy.historicalData;
      if (typeof historicalData === 'string') {
        try {
          historicalData = JSON.parse(historicalData);
        } catch {
          return;
        }
      }

      if (historicalData?.entries && Array.isArray(historicalData.entries)) {
        historicalData.entries.forEach((entry: any) => {
          if (!entry.date || entry.live === undefined || entry.live === null) return;

          const entryDate = new Date(entry.date);
          if (isNaN(entryDate.getTime())) return;

          const livePnL = parseNumeric(entry.live);
          if (isNaN(livePnL)) return;

          let periodKey: string;
          if (periodType === 'daily') {
            periodKey = format(entryDate, 'yyyy-MM-dd');
          } else if (periodType === 'weekly') {
            periodKey = getWeekKey(entryDate);
          } else {
            periodKey = getMonthKey(entryDate);
          }

          if (!periodMap.has(periodKey)) {
            periodMap.set(periodKey, { trades: [], strategyEntries: [] });
          }

          periodMap.get(periodKey)!.strategyEntries.push({ date: entryDate, pnl: livePnL });
        });
      }
    });
  }

  // Calculate statistics for each period
  const periodStats: PeriodStatistics[] = [];

  periodMap.forEach((data, periodKey) => {
    const stats: StatisticsProps = {
      cumulativeFees: 0,
      cumulativePnl: 0,
      winningStreak: 0,
      winRate: 0,
      nbTrades: 0,
      nbBe: 0,
      nbWin: 0,
      nbLoss: 0,
      totalPositionTime: 0,
      averagePositionTime: '0s',
      profitFactor: 1,
      grossLosses: 0,
      grossWin: 0,
      totalPayouts: 0,
      nbPayouts: 0,
    };

    // Process trades for this period
    data.trades.forEach((trade: Trade) => {
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : parseFloat(String(trade.pnl)) || 0;
      const commission = typeof trade.commission === 'number' ? trade.commission : parseFloat(String(trade.commission)) || 0;
      const timeInPosition = typeof trade.timeInPosition === 'number' ? trade.timeInPosition : parseFloat(String(trade.timeInPosition)) || 0;

      if (isNaN(pnl)) return;

      stats.nbTrades++;
      stats.cumulativePnl += pnl;
      stats.cumulativeFees += isNaN(commission) ? 0 : commission;
      stats.totalPositionTime += isNaN(timeInPosition) ? 0 : timeInPosition;

      if (pnl === 0) {
        stats.nbBe++;
      } else if (pnl > 0) {
        stats.nbWin++;
        stats.winningStreak++;
        stats.grossWin += pnl;
      } else {
        stats.nbLoss++;
        stats.winningStreak = 0;
        stats.grossLosses += Math.abs(pnl);
      }
    });

    // Process strategy entries for this period
    data.strategyEntries.forEach((entry) => {
      const pnl = entry.pnl;
      if (isNaN(pnl)) return;

      stats.nbTrades++;
      stats.cumulativePnl += pnl;

      if (pnl === 0) {
        stats.nbBe++;
      } else if (pnl > 0) {
        stats.nbWin++;
        stats.winningStreak++;
        stats.grossWin += pnl;
      } else {
        stats.nbLoss++;
        stats.winningStreak = 0;
        stats.grossLosses += Math.abs(pnl);
      }
    });

    // Calculate derived metrics
    const totalTrades = stats.nbWin + stats.nbLoss;
    stats.winRate = totalTrades > 0 ? (stats.nbWin / totalTrades) * 100 : 0;

    if (stats.grossLosses > 0) {
      stats.profitFactor = stats.grossWin / stats.grossLosses;
    } else if (stats.grossWin > 0) {
      stats.profitFactor = Number.POSITIVE_INFINITY;
    }

    // Calculate average position time (only for trades)
    const tradesOnly = data.trades.length;
    if (tradesOnly > 0 && stats.totalPositionTime > 0) {
      const averageTimeInSeconds = Math.round(stats.totalPositionTime / tradesOnly);
      stats.averagePositionTime = parsePositionTime(averageTimeInSeconds);
    }

    // Calculate payouts for this period (if accounts have reset dates, filter accordingly)
    accounts.forEach(account => {
      if (account.payouts && Array.isArray(account.payouts)) {
        account.payouts.forEach(payout => {
          if (!payout.date || !payout.amount) return;
          
          try {
            const payoutDate = new Date(payout.date);
            if (isNaN(payoutDate.getTime())) return;
            
            let payoutPeriodKey: string;
            if (periodType === 'daily') {
              payoutPeriodKey = format(payoutDate, 'yyyy-MM-dd');
            } else if (periodType === 'weekly') {
              payoutPeriodKey = getWeekKey(payoutDate);
            } else {
              payoutPeriodKey = getMonthKey(payoutDate);
            }

            if (payoutPeriodKey === periodKey) {
              const payoutAmount = typeof payout.amount === 'number' ? payout.amount : parseFloat(String(payout.amount)) || 0;
              if (!isNaN(payoutAmount) && payoutAmount > 0) {
                if (!account.resetDate || new Date(payout.date) >= new Date(account.resetDate)) {
                  stats.totalPayouts += payoutAmount;
                  stats.nbPayouts++;
                }
              }
            }
          } catch (error) {
            // Skip invalid payout dates
            console.warn('[calculatePeriodStatistics] Invalid payout date:', payout.date, error);
          }
        });
      }
    });

    periodStats.push({
      ...stats,
      period: periodKey,
      periodLabel: formatPeriodLabel(periodKey, periodType),
    });
  });

  // Sort by period (most recent first for daily, oldest first for weekly/monthly)
  return periodStats.sort((a, b) => {
    if (periodType === 'daily') {
      return b.period.localeCompare(a.period);
    } else {
      return a.period.localeCompare(b.period);
    }
  });
}
