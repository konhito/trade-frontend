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
