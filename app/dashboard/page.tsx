'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Trophy, 
  Scale, 
  BarChart3, 
  Brain,
  ArrowUpRight,
  ChevronDown,
  Loader2,
  Target,
  TrendingDown,
  LineChart as LineChartIcon
} from "lucide-react"
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts'
import EquityCurve from '@/components/equity-curve'
import { useData } from '@/context/data-provider'
import { useAuth } from '@/context/auth-provider'
import { listStrategies } from '@/lib/services/strategies'
import { getDashboardStats } from '@/lib/services/dashboard'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import Link from 'next/link'
import PeriodStatisticsComponent from './components/statistics/period-statistics'

export default function Home() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('W')
  const [dateRangeDays, setDateRangeDays] = useState<number>(30)
  const { formattedTrades, statistics, isLoading, refreshTrades } = useData()
  const { user } = useAuth()
  
  const [strategies, setStrategies] = useState<any[]>([])
  const [strategiesLoading, setStrategiesLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(true)

  // Load/persist date range preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboard_date_range_days')
      if (saved) setDateRangeDays(Number(saved))
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('dashboard_date_range_days', String(dateRangeDays)) } catch {}
  }, [dateRangeDays])

  // Fetch dashboard stats and strategies in parallel for better performance
  useEffect(() => {
    if (!user?.id) return
    
    const fetchData = async () => {
      setDashboardStatsLoading(true)
      setStrategiesLoading(true)
      
      try {
        // Fetch both in parallel to reduce total load time
        const [dashboardData, strategiesData] = await Promise.all([
          getDashboardStats(String(user.id), 30, true),
          listStrategies({ userId: String(user.id) })
        ])
        
        setDashboardStats(dashboardData.stats)
        setStrategies(strategiesData.strategies || [])
      } catch (error) {
        // Try to fetch individually if parallel fails
        try {
          const dashboardData = await getDashboardStats(String(user.id), 30, true)
          setDashboardStats(dashboardData.stats)
        } catch (e) {
          // Silently fail - will retry on next mount
        }
        try {
          const strategiesData = await listStrategies({ userId: String(user.id) })
          setStrategies(strategiesData.strategies || [])
        } catch (e) {
          // Silently fail - will retry on next mount
        }
      } finally {
        setDashboardStatsLoading(false)
        setStrategiesLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id])

  

  // Track if we've already done initial load to prevent multiple calls
  const initialLoadRef = useRef(false)
  
  // Auto-refresh trades when user is available (only once on mount)
  useEffect(() => {
    if (!user?.id) return
    
    // Only fetch once when user becomes available
    if (initialLoadRef.current) return
    
    let mounted = true
    initialLoadRef.current = true
    
    const loadData = async () => {
      try {
        if (mounted) {
          // Don't use forceRefresh for automatic loads - only use it for manual refresh actions
          // This prevents the _t= timestamp parameter from being added unnecessarily
          const refreshFn = refreshTrades as any
          await refreshFn(false, String(user.id))
        }
      } catch (error) {
        initialLoadRef.current = false // Reset on error so we can retry
      }
    }
    
    // Small delay to ensure auth context is fully ready
    const timeoutId = setTimeout(() => {
      loadData()
    }, 100)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [user?.id, refreshTrades]) // Removed formattedTrades?.length and isLoading to prevent loops
  
  // Refresh dashboard stats when trades change (debounced to prevent excessive calls)
  useEffect(() => {
    if (!user?.id || !formattedTrades || formattedTrades.length === 0) return
    
    // Only refresh stats if we have trades or if stats are not loaded yet
    // Don't refresh on every length change to avoid loops
    const refreshStats = async () => {
      try {
        setDashboardStatsLoading(true)
        // Don't force refresh stats - use cache if available
        const data = await getDashboardStats(String(user.id), 30, false)
        setDashboardStats(data.stats)
      } catch (error) {
        // Silently fail - stats will update on next page load
      } finally {
        setDashboardStatsLoading(false)
      }
    }
    
    // Debounce: Only refresh after trades have stabilized (2 second delay to reduce calls)
    const timeoutId = setTimeout(() => {
      refreshStats()
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [user?.id, formattedTrades?.length]) // Only refresh when trade count changes

  // This effect is now merged with the one above

  // Use API data directly - no calculation needed
  const metrics = useMemo(() => {
    // Use dashboardStats from API if available
    if (dashboardStats && dashboardStats.overview) {
      const overview = dashboardStats.overview
      
      // Get main metrics - prioritize statistics from useData() which includes trades + strategies
      const highestPnL = overview.highestPnL || 0
      
      // Calculate winRate from statistics (includes trades + strategies)
      // Win rate = (Wins / (Wins + Losses)) * 100
      let winRate = 0
      if (statistics && statistics.nbWin !== undefined && statistics.nbLoss !== undefined) {
        const totalTrades = statistics.nbWin + statistics.nbLoss
        winRate = totalTrades > 0 ? (statistics.nbWin / totalTrades) * 100 : 0
      } else if (overview.winRate !== undefined) {
        winRate = overview.winRate
      } else {
        winRate = 0
      }
      const tradesThisMonth = overview.totalTrades || 0
      
      // Calculate risk/reward from statistics (includes trades + strategies)
      // Risk/Reward = Avg Win / Avg Loss
      let riskReward = '1:0'
      if (statistics && statistics.nbWin > 0 && statistics.nbLoss > 0) {
        const avgWin = statistics.grossWin / statistics.nbWin
        const avgLoss = statistics.grossLosses / statistics.nbLoss
        if (avgLoss > 0) {
          const ratio = avgWin / avgLoss
          riskReward = `1:${ratio.toFixed(1)}`
        }
      } else if (overview.avgRiskReward) {
        // Fallback to API if statistics not available
        riskReward = `1:${overview.avgRiskReward.toFixed(1)}`
      }
      
      // For charts, use monthlyData from API or calculate from formattedTrades if available
      let chartData: { name: string; value: number }[] = []
      let dailyPnLData: { name: string; pnl: number; isProfit: boolean }[] = []
      let tradesByDateData: { name: string; long: number; short: number; total: number }[] = []
      
      // Date range for last N days
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const thirtyDaysAgoDate = new Date(todayDate)
      thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - dateRangeDays)
      
      // Helper function to parse date strings (MMM dd format)
      function parseDateWithMonthName(dateStr: string, year: number): Date {
        const months: { [key: string]: number } = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        }
        const parts = dateStr.split(' ')
        const month = months[parts[0]] ?? 0
        const day = parseInt(parts[1]) || 1
        return new Date(year, month, day)
      }
      
      // Collect daily P&L from all sources
      const dailyPnLMap = new Map<string, number>()
      
      // Use monthlyData from API for equity curve if available
      if (dashboardStats.monthlyData && dashboardStats.monthlyData.length > 0) {
        let cumulativePnL = 0
        chartData = dashboardStats.monthlyData.map((month: any) => {
          cumulativePnL += month.pnl || 0
          return {
            name: month.month,
            value: cumulativePnL
          }
        })
      }
      
      // 1. Add P&L from formattedTrades (individual trades) - ALL TRADES (positive, negative, zero)
      if (formattedTrades && formattedTrades.length > 0) {
        formattedTrades
          .filter(t => {
            const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
            if (!tradeDate || isNaN(tradeDate.getTime())) return false
            tradeDate.setHours(0, 0, 0, 0)
            // Include all trades with valid P&L (including negative values and zero)
            const pnl = typeof t.pnl === 'number' ? t.pnl : (t.pnl !== undefined && t.pnl !== null ? parseFloat(String(t.pnl)) : null)
            return tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate && pnl !== null && !isNaN(pnl)
          })
          .forEach(t => {
            const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
            if (!tradeDate) return
            const dateKey = format(tradeDate, 'MMM dd')
            const existing = dailyPnLMap.get(dateKey) || 0
            // Ensure P&L is properly parsed as a number (handles negative values correctly)
            // Note: P&L stored in database already has convenience fee subtracted (from backend calculation)
            const pnl = typeof t.pnl === 'number' ? t.pnl : (t.pnl !== undefined && t.pnl !== null ? parseFloat(String(t.pnl)) : 0)
            const commission = typeof t.commission === 'number' ? t.commission : (t.commission !== undefined && t.commission !== null ? parseFloat(String(t.commission)) : 0)
            // P&L already has convenience fee subtracted, so only subtract commission
            const netPnL = pnl - commission
            // Check if the value is valid (not NaN)
            if (!isNaN(netPnL)) {
              dailyPnLMap.set(dateKey, existing + netPnL)
            }
          })
      }
      
      // 2. Add P&L from topTrades - ALL TRADES - BUT exclude outliers that would skew the daily chart scale
      // TopTrades may contain aggregated or very large values that make other bars invisible
      if (dashboardStats.topTrades && dashboardStats.topTrades.length > 0) {
        dashboardStats.topTrades.forEach((trade: any) => {
          if (trade.entryDate) {
            const tradeDate = new Date(trade.entryDate)
            tradeDate.setHours(0, 0, 0, 0)
            if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
              // Filter out extreme outliers (values > 1 million) that would skew the chart
              // These are likely data errors or aggregated values that shouldn't be in daily granularity
              // Ensure P&L is properly parsed as a number (handles negative values correctly)
              const tradePnLValue = typeof trade.pnl === 'number' ? trade.pnl : (trade.pnl !== undefined && trade.pnl !== null ? parseFloat(String(trade.pnl)) : 0)
              const tradePnL = Math.abs(tradePnLValue)
              // Include all trades with P&L < 1 million for daily chart (positive, negative, zero)
              if (tradePnL < 1000000 && !isNaN(tradePnLValue)) {
                const dateKey = format(tradeDate, 'MMM dd')
                const existing = dailyPnLMap.get(dateKey) || 0
                dailyPnLMap.set(dateKey, existing + tradePnLValue)
              }
            }
          }
        })
      }
      
      // 3. Add P&L from all strategies' historicalData
      if (strategies && strategies.length > 0) {
        let strategyTradesCount = 0
        strategies.forEach((strategy: any) => {
          if (!strategy.historicalData) return
          
          let historicalData = strategy.historicalData
          // Parse if it's a string
          if (typeof historicalData === 'string') {
            try {
              historicalData = JSON.parse(historicalData)
            } catch {
              return // Skip if parsing fails
            }
          }
          
          // Check if historicalData has entries array
          if (historicalData && historicalData.entries && Array.isArray(historicalData.entries)) {
            historicalData.entries.forEach((entry: any) => {
              if (!entry.date) return
              
              const tradeDate = new Date(entry.date)
              if (isNaN(tradeDate.getTime())) return
              
              tradeDate.setHours(0, 0, 0, 0)
              // Ensure P&L is properly parsed as a number (handles negative values correctly)
              const livePnL = typeof entry.live === 'number' ? entry.live : (entry.live !== undefined && entry.live !== null ? parseFloat(String(entry.live)) : 0)
              
              // Skip if P&L is invalid (NaN), but allow negative and zero values
              if (isNaN(livePnL)) return
              
              if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
                const dateKey = format(tradeDate, 'MMM dd')
                const existing = dailyPnLMap.get(dateKey) || 0
                dailyPnLMap.set(dateKey, existing + livePnL)
                strategyTradesCount++
              }
            })
          }
        })
      }
      
      // Convert map to array and sort
      dailyPnLMap.forEach((pnl, date) => {
        dailyPnLData.push({
          name: date,
          pnl: pnl,
          isProfit: pnl >= 0
        })
      })
      
      
      // Sort daily P&L data by date
      dailyPnLData.sort((a, b) => {
        const currentYear = new Date().getFullYear()
        const dateA = parseDateWithMonthName(a.name, currentYear)
        const dateB = parseDateWithMonthName(b.name, currentYear)
        return dateA.getTime() - dateB.getTime()
      })
        
        // Trades by date data - calculate from formattedTrades
        const tradesByDateMap = new Map<string, { long: number; short: number }>()
        if (formattedTrades && formattedTrades.length > 0) {
          formattedTrades
            .filter(t => {
              const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
              if (!tradeDate || isNaN(tradeDate.getTime())) return false
              tradeDate.setHours(0, 0, 0, 0)
              // Include all trades (positive, negative, zero P&L)
              return tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate
            })
            .forEach(t => {
              const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
              if (!tradeDate) return
              const dateKey = format(tradeDate, 'MMM dd')
              const existing = tradesByDateMap.get(dateKey) || { long: 0, short: 0 }
              const side = (t.side || '').toLowerCase()
              const direction = (t.direction || '').toLowerCase()
              const isLong = side === 'long' || direction === 'long' || side === 'buy' || direction === 'buy'
              const isShort = side === 'short' || direction === 'short' || side === 'sell' || direction === 'sell'
              
              if (isLong) {
                existing.long++
              } else if (isShort) {
                existing.short++
              } else {
                // If direction is unclear, default to long (you can adjust this logic)
                existing.long++
              }
              tradesByDateMap.set(dateKey, existing)
            })
        }
        
        // Add trades from strategies' historicalData (count each entry as a trade)
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
                if (!entry.date) return
                
                const tradeDate = new Date(entry.date)
                if (isNaN(tradeDate.getTime())) return
                
                tradeDate.setHours(0, 0, 0, 0)
                if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
                  const dateKey = format(tradeDate, 'MMM dd')
                  const existing = tradesByDateMap.get(dateKey) || { long: 0, short: 0 }
                  // Increment total (we don't have direction info from historicalData, so count as total)
                  existing.long++ // Count strategy trades as part of total
                  tradesByDateMap.set(dateKey, existing)
                }
              })
            }
          })
        }
        
        tradesByDateData = Array.from(tradesByDateMap.entries())
          .map(([date, counts]) => ({
            name: date,
            long: counts.long,
            short: counts.short,
            total: counts.long + counts.short
          }))
          .sort((a, b) => {
            const currentYear = new Date().getFullYear()
            const dateA = parseDateWithMonthName(a.name, currentYear)
            const dateB = parseDateWithMonthName(b.name, currentYear)
            return dateA.getTime() - dateB.getTime()
          })
      
      // Calculate long/short trade counts from formattedTrades (most accurate) - ALL TRADES
      // Use formattedTrades as primary source since it includes all filtered trades
      let longTrades = 0
      let shortTrades = 0
      
      if (formattedTrades && formattedTrades.length > 0) {
        // Count from formattedTrades - ALL TRADES (positive, negative, zero)
        formattedTrades.forEach(t => {
          const side = (t.side || '').toLowerCase()
          const direction = (t.direction || '').toLowerCase()
          const isLong = side === 'long' || direction === 'long' || side === 'buy' || direction === 'buy'
          const isShort = side === 'short' || direction === 'short' || side === 'sell' || direction === 'sell'
          
          if (isLong) {
            longTrades++
          } else if (isShort) {
            shortTrades++
          } else {
            // If no clear direction, try to infer from entry/exit dates or default to long
            // For now, we'll count as long if uncertain (you can adjust this logic)
            longTrades++
          }
        })
      } else if (dashboardStats.topTrades && dashboardStats.topTrades.length > 0) {
        // Fallback to topTrades if formattedTrades is not available - ALL TRADES
        dashboardStats.topTrades.forEach((trade: any) => {
          const direction = (trade.direction || '').toLowerCase()
          if (direction === 'long' || direction === 'buy') {
            longTrades++
          } else if (direction === 'short' || direction === 'sell') {
            shortTrades++
          }
        })
      }
      
      // Also add strategy historical data entries as trades (count as total, no direction info)
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
            // Count strategy entries as long trades (since we don't have direction info)
            historicalData.entries.forEach((entry: any) => {
              if (entry.date) {
                const tradeDate = new Date(entry.date)
                if (!isNaN(tradeDate.getTime())) {
                  tradeDate.setHours(0, 0, 0, 0)
                  if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
                    longTrades++ // Count strategy entries as trades
                  }
                }
              }
            })
          }
        })
      }
      
      // Calculate cumulative P&L from daily P&L data (ensure all values are numbers, handles negative correctly)
      const cumulativePnL = dailyPnLData.reduce((sum, day) => {
        const dayPnL = typeof day.pnl === 'number' ? day.pnl : parseFloat(String(day.pnl)) || 0
        return sum + (isNaN(dayPnL) ? 0 : dayPnL)
      }, 0)
      
      return {
        highestPnL,
        cumulativePnL,
        winRate,
        riskReward,
        tradesThisMonth,
        chartData,
        dailyPnLData,
        longTrades,
        shortTrades,
        tradesByDateData
      }
    }
    
    // Fallback: Calculate metrics from strategies and formattedTrades if no dashboardStats
    
    // Date range for last N days
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    const thirtyDaysAgoDate = new Date(todayDate)
    thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - dateRangeDays)
    
    // Helper function to parse date strings (MMM dd format)
    function parseDateWithMonthName(dateStr: string, year: number): Date {
      const months: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      }
      const parts = dateStr.split(' ')
      const month = months[parts[0]] ?? 0
      const day = parseInt(parts[1]) || 1
      return new Date(year, month, day)
    }
    
    // Collect daily P&L from all sources
    const dailyPnLMap = new Map<string, number>()
    let dailyPnLData: { name: string; pnl: number; isProfit: boolean }[] = []
    
    // Add P&L from formattedTrades
    if (formattedTrades && formattedTrades.length > 0) {
      formattedTrades
        .filter(t => {
          const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
          if (!tradeDate || isNaN(tradeDate.getTime())) return false
          tradeDate.setHours(0, 0, 0, 0)
          const pnl = typeof t.pnl === 'number' ? t.pnl : (t.pnl !== undefined && t.pnl !== null ? parseFloat(String(t.pnl)) : null)
          return tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate && pnl !== null && !isNaN(pnl)
        })
        .forEach(t => {
          const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
          if (!tradeDate) return
          const dateKey = format(tradeDate, 'MMM dd')
          const existing = dailyPnLMap.get(dateKey) || 0
          // Note: P&L stored in database already has convenience fee subtracted (from backend calculation)
          const pnl = typeof t.pnl === 'number' ? t.pnl : (t.pnl !== undefined && t.pnl !== null ? parseFloat(String(t.pnl)) : 0)
          const commission = typeof t.commission === 'number' ? t.commission : (t.commission !== undefined && t.commission !== null ? parseFloat(String(t.commission)) : 0)
          // P&L already has convenience fee subtracted, so only subtract commission
          const netPnL = pnl - commission
          if (!isNaN(netPnL)) {
            dailyPnLMap.set(dateKey, existing + netPnL)
          }
        })
    }
    
    // Add P&L from strategies' historicalData
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
            if (!entry.date) return
            
            const tradeDate = new Date(entry.date)
            if (isNaN(tradeDate.getTime())) return
            
            tradeDate.setHours(0, 0, 0, 0)
            const livePnL = typeof entry.live === 'number' ? entry.live : (entry.live !== undefined && entry.live !== null ? parseFloat(String(entry.live)) : 0)
            
            if (!isNaN(livePnL) && tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
              const dateKey = format(tradeDate, 'MMM dd')
              const existing = dailyPnLMap.get(dateKey) || 0
              dailyPnLMap.set(dateKey, existing + livePnL)
            }
          })
        }
      })
    }
    
    // Convert map to array and sort
    dailyPnLMap.forEach((pnl, date) => {
      dailyPnLData.push({
        name: date,
        pnl: pnl,
        isProfit: pnl >= 0
      })
    })
    
    dailyPnLData.sort((a, b) => {
      const currentYear = new Date().getFullYear()
      const dateA = parseDateWithMonthName(a.name, currentYear)
      const dateB = parseDateWithMonthName(b.name, currentYear)
      return dateA.getTime() - dateB.getTime()
    })
    
    // Calculate metrics from strategies and trades
    const cumulativePnL = dailyPnLData.reduce((sum, day) => {
      const dayPnL = typeof day.pnl === 'number' ? day.pnl : parseFloat(String(day.pnl)) || 0
      return sum + (isNaN(dayPnL) ? 0 : dayPnL)
    }, 0)
    
    // Calculate winRate from statistics (includes trades + strategies)
    // Win rate = (Wins / (Wins + Losses)) * 100
    let winRate = 0
    if (statistics && statistics.nbWin !== undefined && statistics.nbLoss !== undefined) {
      const totalTrades = statistics.nbWin + statistics.nbLoss
      winRate = totalTrades > 0 ? (statistics.nbWin / totalTrades) * 100 : 0
    } else if (statistics?.winRate !== undefined) {
      winRate = statistics.winRate
    } else {
      winRate = 0
    }
    
    // Calculate risk/reward from statistics (includes trades + strategies)
    let riskReward = '1:0'
    if (statistics && statistics.nbWin > 0 && statistics.nbLoss > 0) {
      const avgWin = statistics.grossWin / statistics.nbWin
      const avgLoss = statistics.grossLosses / statistics.nbLoss
      if (avgLoss > 0) {
        const ratio = avgWin / avgLoss
        riskReward = `1:${ratio.toFixed(1)}`
      }
    }
    
    // Count trades from strategies and formattedTrades
    let tradesThisMonth = 0
    if (formattedTrades && formattedTrades.length > 0) {
      tradesThisMonth += formattedTrades.length
    }
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
          tradesThisMonth += historicalData.entries.filter((entry: any) => {
            if (!entry.date) return false
            const tradeDate = new Date(entry.date)
            if (isNaN(tradeDate.getTime())) return false
            tradeDate.setHours(0, 0, 0, 0)
            return tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate
          }).length
        }
      })
    }
    
    // Calculate highest P&L
    const highestPnL = dailyPnLData.length > 0 ? Math.max(...dailyPnLData.map(d => d.pnl)) : 0
    
    // Calculate long/short trades
    let longTrades = 0
    let shortTrades = 0
    if (formattedTrades && formattedTrades.length > 0) {
      formattedTrades.forEach(t => {
        const side = (t.side || '').toLowerCase()
        const direction = (t.direction || '').toLowerCase()
        const isLong = side === 'long' || direction === 'long' || side === 'buy' || direction === 'buy'
        const isShort = side === 'short' || direction === 'short' || side === 'sell' || direction === 'sell'
        if (isLong) longTrades++
        else if (isShort) shortTrades++
        else longTrades++
      })
    }
    // Count strategy entries as trades
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
            if (entry.date) {
              const tradeDate = new Date(entry.date)
              if (!isNaN(tradeDate.getTime())) {
                tradeDate.setHours(0, 0, 0, 0)
                if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
                  longTrades++
                }
              }
            }
          })
        }
      })
    }
    
    // Trades by date data
    const tradesByDateMap = new Map<string, { long: number; short: number }>()
    if (formattedTrades && formattedTrades.length > 0) {
      formattedTrades
        .filter(t => {
          const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
          if (!tradeDate || isNaN(tradeDate.getTime())) return false
          tradeDate.setHours(0, 0, 0, 0)
          return tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate
        })
        .forEach(t => {
          const tradeDate = t.closeDate ? new Date(t.closeDate) : (t.entryDate ? new Date(t.entryDate) : null)
          if (!tradeDate) return
          const dateKey = format(tradeDate, 'MMM dd')
          const existing = tradesByDateMap.get(dateKey) || { long: 0, short: 0 }
          const side = (t.side || '').toLowerCase()
          const direction = (t.direction || '').toLowerCase()
          const isLong = side === 'long' || direction === 'long' || side === 'buy' || direction === 'buy'
          const isShort = side === 'short' || direction === 'short' || side === 'sell' || direction === 'sell'
          if (isLong) existing.long++
          else if (isShort) existing.short++
          else existing.long++
          tradesByDateMap.set(dateKey, existing)
        })
    }
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
            if (!entry.date) return
            const tradeDate = new Date(entry.date)
            if (isNaN(tradeDate.getTime())) return
            tradeDate.setHours(0, 0, 0, 0)
            if (tradeDate >= thirtyDaysAgoDate && tradeDate <= todayDate) {
              const dateKey = format(tradeDate, 'MMM dd')
              const existing = tradesByDateMap.get(dateKey) || { long: 0, short: 0 }
              existing.long++
              tradesByDateMap.set(dateKey, existing)
            }
          })
        }
      })
    }
    
    const tradesByDateData = Array.from(tradesByDateMap.entries())
      .map(([date, counts]) => ({
        name: date,
        long: counts.long,
        short: counts.short,
        total: counts.long + counts.short
      }))
      .sort((a, b) => {
        const currentYear = new Date().getFullYear()
        const dateA = parseDateWithMonthName(a.name, currentYear)
        const dateB = parseDateWithMonthName(b.name, currentYear)
        return dateA.getTime() - dateB.getTime()
      })
    
    return {
      highestPnL,
      cumulativePnL,
      winRate,
      riskReward,
      tradesThisMonth,
      chartData: [], // No monthly data available
      dailyPnLData,
      longTrades,
      shortTrades,
      tradesByDateData
    }
  }, [formattedTrades, statistics, strategies, dashboardStats, dateRangeDays, statistics?.winRate, statistics?.profitFactor, statistics?.grossWin, statistics?.grossLosses, statistics?.nbWin, statistics?.nbLoss, statistics?.nbTrades])

  // Check if we have data - prioritize dashboardStats from API
  // Also check if there are strategies with historical data
  const hasStrategiesWithData = strategies && strategies.length > 0 && strategies.some((s: any) => {
    if (!s.historicalData) return false
    let historicalData = s.historicalData
    if (typeof historicalData === 'string') {
      try {
        historicalData = JSON.parse(historicalData)
      } catch {
        return false
      }
    }
    return historicalData && historicalData.entries && Array.isArray(historicalData.entries) && historicalData.entries.length > 0
  })
  
  const hasNoData = useMemo(() => {
    return !dashboardStats?.overview || (dashboardStats.overview.totalTrades === 0 && (!formattedTrades || formattedTrades.length === 0) && !hasStrategiesWithData)
  }, [dashboardStats?.overview, formattedTrades?.length, hasStrategiesWithData])

  // Memoize active strategies for rendering
  const activeStrategies = useMemo(() => {
    return strategies.filter(s => s.isActive).slice(0, 6)
  }, [strategies])


  if (isLoading) {
    return (
      <div className="p-2 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 bg-background text-foreground">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                <Skeleton className="h-2 sm:h-3 w-32 sm:w-40" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Confidence Index Skeleton */}
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-64" />
          </CardContent>
        </Card>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 bg-background text-foreground min-h-screen">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* Cumulative P&L */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Cumulative P&L</span>
              </div>
              <LineChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 opacity-80" />
            </div>
            <div className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-1 sm:mb-2 break-words ${
              dashboardStatsLoading || hasNoData ? 'text-muted-foreground' : 
              metrics.cumulativePnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {dashboardStatsLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : hasNoData ? '₹0' : `₹${metrics.cumulativePnL.toLocaleString('en-IN')}`}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              {dashboardStatsLoading ? 'Loading...' : hasNoData ? 'No trades' : `Last ${dateRangeDays} days`}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                metrics.cumulativePnL >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`} style={{ width: dashboardStatsLoading || hasNoData ? '0%' : '100%' }}></div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Win Rate</span>
              </div>
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 opacity-80" />
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-blue-500 mb-1 sm:mb-2 break-words">
              {dashboardStatsLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : hasNoData ? '0%' : `${metrics.winRate.toFixed(1)}%`}
            </div>
            <Progress value={metrics.winRate} className="h-2 bg-muted mt-2 sm:mt-3">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${metrics.winRate}%` }}></div>
            </Progress>
          </CardContent>
        </Card>
        </motion.div>

        {/* Avg Risk/Reward */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Risk/Reward</span>
              </div>
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 opacity-80" />
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-purple-500 mb-1 sm:mb-2 break-words">
              {dashboardStatsLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : hasNoData ? '1:0' : metrics.riskReward}
            </div>
            <div className="text-xs sm:text-sm text-purple-500/90 mb-2 sm:mb-3">
              {dashboardStatsLoading ? 'Loading...' : hasNoData ? 'No trades' : `Profit Factor: ${statistics?.profitFactor ? (statistics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : statistics.profitFactor.toFixed(2)) : (dashboardStats?.overview?.profitFactor?.toFixed(2) || '0.00')}`}
            </div>
            <Progress value={dashboardStatsLoading ? 0 : hasNoData ? 0 : Math.min((dashboardStats?.overview?.profitFactor || 0) * 10, 100)} className="h-2 bg-muted">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${dashboardStatsLoading ? 0 : hasNoData ? 0 : Math.min((dashboardStats?.overview?.profitFactor || 0) * 10, 100)}%` }}></div>
            </Progress>
          </CardContent>
        </Card>
        </motion.div>

        {/* Trades This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Trades This Month</span>
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 opacity-80" />
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-orange-500 mb-1 sm:mb-2 break-words">
              {dashboardStatsLoading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" /> : hasNoData ? '0' : metrics.tradesThisMonth}
            </div>
            <div className="text-xs sm:text-sm text-orange-500/90 mb-2 sm:mb-3">
              {dashboardStatsLoading ? 'Loading...' : hasNoData ? 'No trades' : (() => {
                const avgPnL = statistics?.nbTrades && statistics.nbTrades > 0 
                  ? (statistics.cumulativePnl || 0) / statistics.nbTrades 
                  : 0
                const avgWin = statistics?.nbWin && statistics.nbWin > 0 
                  ? (statistics.grossWin || 0) / statistics.nbWin 
                  : 0
                const avgLoss = statistics?.nbLoss && statistics.nbLoss > 0 
                  ? (statistics.grossLosses || 0) / statistics.nbLoss 
                  : 0
                return `Avg P&L: ${avgPnL >= 0 ? '+' : ''}₹${Math.abs(avgPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })} • Win/Loss: ₹${avgWin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/₹${avgLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              })()}
            </div>
            <Progress value={dashboardStatsLoading ? 0 : hasNoData ? 0 : Math.min((metrics.tradesThisMonth / Math.max(dashboardStats?.overview?.totalTrades || 1, 1)) * 100, 100)} className="h-2 bg-muted">
              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${dashboardStatsLoading ? 0 : hasNoData ? 0 : Math.min((metrics.tradesThisMonth / Math.max(dashboardStats?.overview?.totalTrades || 1, 1)) * 100, 100)}%` }}></div>
            </Progress>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Confidence Index removed per request */}

      {/* Daily Profit/Loss Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">Daily Profit/Loss</CardTitle>
                <div className="text-xs text-muted-foreground mt-0.5">Net of fees • Live strategies • Last {dateRangeDays} days</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
              {hasNoData && metrics.dailyPnLData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add trades to see daily profit/loss</p>
                  </div>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={metrics.dailyPnLData || []} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barSize={20}
                    >
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{fontSize: 10}}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      tick={{fontSize: 10}}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={50}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `₹${(value/1000000).toFixed(1)}M`
                        if (value >= 1000) return `₹${(value/1000).toFixed(1)}K`
                        return `₹${value.toFixed(0)}`
                      }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" opacity={0.5} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      content={(props: any) => {
                        const payload = props?.payload && props.payload.length > 0 ? props.payload[0] : null
                        const date = props?.label || ''
                        const value = typeof payload?.value === 'number' ? payload.value : Number(payload?.value || 0)
                        // Properly format with + for positive and - for negative
                        const sign = value >= 0 ? '+' : '-'
                        const formatted = `${sign}₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        if (!payload) return null
                        return (
                          <div style={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 8,
                            color: 'hsl(var(--foreground))',
                            padding: 12,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                          }}>
                            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>{date}</div>
                            <div style={{ 
                              fontWeight: 700,
                              color: value >= 0 ? '#10b981' : '#ef4444'
                            }}>{formatted}</div>
                          </div>
                        )
                      }}
                    />
                    <Bar 
                      dataKey="pnl" 
                      radius={[4, 4, 0, 0]}
                    >
                      {metrics.dailyPnLData && metrics.dailyPnLData.length > 0 ? metrics.dailyPnLData.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}-${entry.name || index}`} 
                          fill={entry.isProfit ? "#10b981" : "#ef4444"}
                        />
                      )) : null}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Equity Curve Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">Equity Curve</CardTitle>
                <div className="text-xs text-muted-foreground mt-0.5">Net of fees • Live strategies • Last {dateRangeDays} days</div>
              </div>
              <div className="flex space-x-1 bg-background/50 border border-border p-0.5 sm:p-1 rounded-md">
                {[7,30,90].map((d) => (
                  <Button
                    key={d}
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRangeDays(d)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs h-6 sm:h-7 transition-all ${
                      dateRangeDays === d ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    {d}d
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
              <EquityCurve dailyPnLData={metrics.dailyPnLData} rangeDays={dateRangeDays} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strategies Overview */}
      {strategies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground">Active Strategies</CardTitle>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Performance overview of your trading strategies
                  </div>
                </div>
                <Link href="/dashboard/strategies">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs sm:text-sm h-7 sm:h-8">
                    View All
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {strategiesLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Loading strategies...</span>
                </div>
              ) : strategies.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
                  No strategies created yet. <Link href="/dashboard/strategies" className="text-primary hover:underline">Create one</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {activeStrategies.map((strategy) => {
                    // Calculate metrics from historical data
                    let tradesFromHistorical = 0
                    let winRateFromHistorical = 0
                    let profitFactorFromHistorical = 0
                    let totalProfit = 0
                    
                    // Parse historicalData - it might be a JSON string
                    let parsedHistoricalData = strategy.historicalData
                    if (typeof parsedHistoricalData === 'string') {
                      try {
                        parsedHistoricalData = JSON.parse(parsedHistoricalData)
                      } catch (e) {
                        parsedHistoricalData = null
                      }
                    }
                    
                    if (parsedHistoricalData && parsedHistoricalData.entries && Array.isArray(parsedHistoricalData.entries)) {
                      const entries = parsedHistoricalData.entries
                      tradesFromHistorical = entries.length
                      
                      if (tradesFromHistorical > 0) {
                        // Calculate win rate from live P&L entries (count positive entries)
                        const liveEntries = entries.map((e: any) => {
                          const liveValue = parseFloat(String(e.live || '0')) || 0
                          return liveValue
                        })
                        
                        // Calculate total profit (sum of all P&L entries)
                        totalProfit = liveEntries.reduce((sum: number, pnl: number) => sum + pnl, 0)
                        
                        const winningEntries = liveEntries.filter((pnl: number) => pnl > 0).length
                        winRateFromHistorical = (winningEntries / tradesFromHistorical) * 100
                        
                        // Calculate profit factor from live data
                        const totalProfitOnly = liveEntries.filter((pnl: number) => pnl > 0).reduce((sum: number, pnl: number) => sum + pnl, 0)
                        const totalLoss = Math.abs(liveEntries.filter((pnl: number) => pnl < 0).reduce((sum: number, pnl: number) => sum + pnl, 0))
                        profitFactorFromHistorical = totalLoss > 0 ? totalProfitOnly / totalLoss : (totalProfitOnly > 0 ? 999 : 0)
                      }
                    }
                    
                    // Use historical data if available, otherwise fall back to strategy stats from trades
                    const displayTrades = tradesFromHistorical > 0 ? tradesFromHistorical : (strategy.totalTrades || 0)
                    const displayWinRate = tradesFromHistorical > 0 ? winRateFromHistorical : (strategy.winRate || 0)
                    const displayProfitFactor = tradesFromHistorical > 0 ? profitFactorFromHistorical : (strategy.profitFactor || 0)
                    const displayProfit = totalProfit !== 0 ? totalProfit : (strategy.totalPnl || strategy.totalProfit || 0)
                    
                    // Format profit for display
                    const formatProfit = (profit: number) => {
                          const sign = profit >= 0 ? '+' : '-';
                          return `${sign}₹${Math.abs(profit).toLocaleString('en-IN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}`;
                      };
                    
                    return (
                      <Card key={strategy.id} className="bg-muted/30 border-border hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 truncate">{strategy.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{strategy.category}</p>
                            </div>
                            <Badge 
                              variant={displayProfit >= 0 ? "default" : "destructive"}
                              className={`text-xs font-semibold ${
                                displayProfit >= 0 
                                  ? "bg-green-500 text-white hover:bg-green-600" 
                                  : "bg-red-500 text-white hover:bg-red-600"
                              }`}
                            >
                              {formatProfit(displayProfit)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                              <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                                {displayWinRate.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
                              <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                                {displayTrades}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-xs text-muted-foreground mb-1">Profit Factor</div>
                              <div className={`text-sm sm:text-base md:text-lg font-bold ${
                                displayProfitFactor > 1 ? 'text-green-500' : 
                                displayProfitFactor > 0 ? 'text-yellow-500' : 'text-red-500'
                              }`}>
                                {displayProfitFactor.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {strategy.description && (
                            <p className="text-xs text-muted-foreground mt-2 sm:mt-3 line-clamp-2">
                              {strategy.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Period Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <PeriodStatisticsComponent />
      </motion.div>

    </div>
  )
}
