'use client'

import { createContext, useContext, ReactNode } from 'react'

// Mock data for all dashboard features
const mockData = {
  strategies: [
    {
      id: '1',
      name: 'Breakout Strategy',
      description: 'Trading breakouts above key resistance levels with volume confirmation',
      category: 'Breakout',
      isActive: true,
      winRate: 68.5,
      totalTrades: 45,
      profitFactor: 1.85,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Moving Average Crossover',
      description: 'Using 9 and 21 EMA crossover signals for trend following',
      category: 'Trend',
      isActive: true,
      winRate: 72.3,
      totalTrades: 32,
      profitFactor: 2.1,
      createdAt: '2024-01-10'
    }
  ],
  rules: [
    {
      id: '1',
      title: 'Maximum Risk Per Trade',
      description: 'Never risk more than 2% of account balance on a single trade',
      category: 'Risk Management',
      priority: 1,
      isActive: true,
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    },
    {
      id: '2',
      title: 'Stop Loss Required',
      description: 'Every trade must have a stop loss set before entry',
      category: 'Risk Management',
      priority: 1,
      isActive: true,
      createdAt: '2024-01-10',
      lastUsed: '2024-01-20'
    }
  ],
  mistakes: [
    {
      id: '1',
      title: 'FOMO Entry',
      description: 'Entered a trade based on fear of missing out without proper analysis',
      category: 'Emotional',
      severity: 'High',
      tradeId: 'TRADE-001',
      learnedFrom: false,
      createdAt: '2024-01-20',
      impact: 'Lost $500'
    }
  ],
  reports: [
    {
      id: '1',
      title: 'Weekly Performance Report',
      type: 'Weekly',
      period: { start: '2024-01-15', end: '2024-01-21' },
      data: {
        totalTrades: 12,
        winRate: 75.0,
        profitFactor: 2.1,
        totalPnL: 2500,
        bestTrade: 800,
        worstTrade: -300
      },
      createdAt: '2024-01-21',
      status: 'Completed'
    }
  ],
  challenges: [
    {
      id: '1',
      title: 'Consistency Challenge',
      description: 'Maintain 70% win rate for 30 consecutive trading days',
      type: 'Consistency',
      status: 'ACTIVE',
      target: { winRate: 70, days: 30, currentDays: 15 },
      progress: { current: 15, total: 30, percentage: 50 },
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      reward: 'Advanced Analytics Access'
    }
  ],
  calendar: [
    {
      id: '1',
      title: 'NFP Release',
      description: 'Non-Farm Payrolls data release - High impact on USD pairs',
      type: 'Economic Event',
      date: '2024-01-05',
      time: '08:30',
      timezone: 'EST',
      importance: 'High',
      isRecurring: false,
      reminder: true
    }
  ],
  aiSummaries: [
    {
      id: '1',
      title: 'Weekly Trading Performance Analysis',
      type: 'Daily Summary',
      content: 'This week showed strong performance with a 75% win rate across 12 trades. Key highlights include successful breakout trades on NIFTY and BANKNIFTY.',
      data: {
        winRate: 75,
        totalTrades: 12,
        profitFactor: 2.1,
        keyInsights: ['Breakout strategy performed well', 'Risk management was consistent']
      },
      createdAt: '2024-01-21',
      status: 'Completed'
    }
  ],
  tools: [
    {
      id: '1',
      name: 'Position Size Calculator',
      description: 'Calculate optimal position size based on account balance and risk percentage',
      category: 'Calculator',
      url: '/tools/position-calculator',
      isActive: true,
      config: { riskPercentage: 2, accountBalance: 10000 },
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    }
  ],
  affiliates: [
    {
      id: '1',
      title: 'TradingView Pro',
      description: 'Advanced charting platform with real-time data and technical analysis tools',
      url: 'https://tradingview.com?ref=yourcode',
      category: 'Software',
      isActive: true,
      clicks: 245,
      conversions: 12,
      earnings: 180.50,
      commission: 15.00,
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    }
  ]
}

const MockDataContext = createContext(mockData)

export const useMockData = () => useContext(MockDataContext)

export function MockDataProvider({ children }: { children: ReactNode }) {
  return (
    <MockDataContext.Provider value={mockData}>
      {children}
    </MockDataContext.Provider>
  )
}

