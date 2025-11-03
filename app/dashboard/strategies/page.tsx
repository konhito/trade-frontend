'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { HistoricalDataTable } from "@/components/historical-data-table"
import { StrategyAnalyticsModal } from "@/components/strategy-analytics-modal"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Settings,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Loader2,
  Upload,
  BarChart4,
  Calendar
} from "lucide-react"
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/context/theme-provider'
import { useAuth } from '@/context/auth-provider'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { listStrategies, createStrategy as createStrategyApi, updateStrategy as updateStrategyApi, deleteStrategy as deleteStrategyApi } from '@/lib/services/strategies'

export default function StrategiesPage() {
  const { effectiveTheme } = useTheme()
  const { user, token, isLoading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [importingStrategy, setImportingStrategy] = useState<any | null>(null)
  const [editingStrategy, setEditingStrategy] = useState<any | null>(null)
  const [analyticsStrategy, setAnalyticsStrategy] = useState<any | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [strategies, setStrategies] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const categories = ['All', 'Breakout', 'Trend', 'Mean Reversion', 'Scalping', 'Swing', 'Directional Strategy', 'Non-Directional Strategy', 'Reversal']

  // API functions with silent loading for subsequent calls
  const fetchStrategies = useCallback(async (silent = false) => {
    // Get userId from auth context - use 'default-user' fallback like trades page does
    // This ensures we always make the API call, and the backend will validate via token
    let userId = user?.id || 'default-user'
    
    console.log('[Strategies] fetchStrategies called', { 
      userId, 
      userFromContext: user?.id || 'none',
      authLoading 
    })
    
    try {
      if (!silent) setLoading(true)
      
      console.log('[Strategies] About to call listStrategies API with userId:', userId)
      console.log('[Strategies] Fetching strategies for userId:', userId)
      const data = await listStrategies({
        userId: String(userId),
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      })
      
      let filteredStrategies = data.strategies || []
      
      setStrategies(filteredStrategies)
      console.log('[Strategies] Loaded', filteredStrategies.length, 'strategies')
      
      if (initialLoad) setInitialLoad(false)
    } catch (error: any) {
      console.error('[Strategies] Error fetching strategies:', error)
      if (!silent) toast.error(`Failed to load strategies: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [user?.id, token, authLoading, selectedCategory, searchTerm])

  const createStrategy = async (strategyData: any) => {
    console.log('[Strategies] createStrategy called with:', strategyData)
    
    // Get userId from auth context
    const userId = user?.id
    
    if (!userId) {
      console.error('[Strategies] No userId available for creating strategy', { user, token: token ? 'exists' : 'missing' })
      
      // Try to get userId from token if user object is not yet loaded
      if (token) {
        try {
          const { apiFetch } = await import('@/lib/api')
          const fetchedUser = await apiFetch<{ id: number; email: string }>('/auth/me', { token })
          if (fetchedUser?.id) {
            console.log('[Strategies] Fetched userId from token:', fetchedUser.id)
            const data = await createStrategyApi({
              userId: String(fetchedUser.id),
              ...strategyData
            })
            await fetchStrategies(true)
            toast.success('Strategy created successfully')
            return
          }
        } catch (fetchError) {
          console.error('[Strategies] Error fetching user from token:', fetchError)
        }
      }
      
      toast.error('Please sign in to create a strategy')
      return
    }
    
    console.log('[Strategies] Using userId:', userId, 'type:', typeof userId)
    
    try {
      const data = await createStrategyApi({
        userId: String(userId),
        ...strategyData
      })
      console.log('[Strategies] Strategy created successfully:', data)
      
      // Refresh strategies list to get updated stats (this will use the same userId)
      await fetchStrategies(true)
      
      toast.success('Strategy created successfully')
    } catch (error: any) {
      console.error('[Strategies] Error creating strategy:', error)
      const errorMessage = error?.message || error?.error || 'Unknown error'
      toast.error(`Failed to create strategy: ${errorMessage}`)
      throw error // Re-throw so the modal can handle it
    }
  }

  const updateStrategy = async (id: string, updateData: any) => {
    try {
      const data = await updateStrategyApi({ id, ...updateData })
      setStrategies(prev => prev.map(s => s.id === id ? data.strategy : s))
      toast.success('Strategy updated successfully')
    } catch (error: any) {
      console.error('Error updating strategy:', error)
      toast.error(`Failed to update strategy: ${error.message || 'Unknown error'}`)
    }
  }

  const toggleActive = async (strategy: any) => {
    await updateStrategy(strategy.id, { isActive: !strategy.isActive })
  }

  const deleteStrategy = async (id: string) => {
    try {
      await deleteStrategyApi(id)
      setStrategies(prev => prev.filter(s => s.id !== id))
      toast.success('Strategy deleted successfully')
    } catch (error: any) {
      console.error('Error deleting strategy:', error)
      toast.error(`Failed to delete strategy: ${error.message || 'Unknown error'}`)
    }
  }

  // Load strategies on component mount and when user/auth changes (similar to trades page)
  useEffect(() => {
    console.log('[Strategies] Effect triggered - user:', user, 'authLoading:', authLoading, 'token:', token ? 'exists' : 'null', 'user?.id:', user?.id)
    // Always try to fetch - fetchStrategies will handle getting userId from user or token
    fetchStrategies(false)
  }, [user, token, authLoading, fetchStrategies])
  
  // Silently update when filters change (if data already exists)
  useEffect(() => {
    if (!initialLoad && !authLoading) {
      fetchStrategies(true)
    }
  }, [selectedCategory, searchTerm, fetchStrategies, initialLoad, authLoading])

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (strategy.description && strategy.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || strategy.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Breakout': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Trend': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Mean Reversion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Scalping': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Swing': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'Directional Strategy': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
      case 'Non-Directional Strategy': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'Reversal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="flex-1 bg-background p-3 sm:p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading Strategies</h1>
            <p className="text-muted-foreground">Manage and track your trading strategies</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-input text-foreground placeholder-muted-foreground"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded text-foreground text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button variant="outline" className="border-input text-muted-foreground hover:bg-accent">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Strategies</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className={`text-2xl font-bold ${strategies.length > 0 ? 'text-green-500' : 'text-foreground'}`}>
                  {strategies.length}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active Strategies</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-green-500">{strategies.filter(s => s.isActive).length}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Avg Win Rate (All Strategies)</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-foreground">
                  {strategies.length > 0 ? 
                    (strategies.reduce((sum, s) => sum + (s.winRate || 0), 0) / strategies.length).toFixed(1) + '%' : 
                    '0%'}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {strategies.length} strategies
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No strategies found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first trading strategy to get started'
              }
            </p>
            {!searchTerm && selectedCategory === 'All' && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Strategy
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredStrategies.map((strategy, index) => {
              // Calculate strategy performance for color coding
              const calculatePerformance = () => {
                if (!strategy.historicalData?.entries || strategy.historicalData.entries.length === 0) {
                  return { totalPnL: 0, avgDailyPnL: 0, hasData: false }
                }
                
                const entries = strategy.historicalData.entries
                // Use only LIVE values for P&L calculations
                const parseNum = (v: any) => {
                  if (typeof v === 'number' && Number.isFinite(v)) return v
                  const n = Number(String(v).replace(/[^0-9.+-]/g, ''))
                  return Number.isFinite(n) ? n : 0
                }
                const liveValues: number[] = entries.map((e: any) => parseNum(e.live))
                const totalPnL = liveValues.reduce((sum, v) => sum + v, 0)
                const avgDailyPnL = liveValues.length > 0 ? totalPnL / liveValues.length : 0
                
                return { totalPnL, avgDailyPnL, hasData: true }
              }
              
              const performance = calculatePerformance()
              const isProfitable = performance.totalPnL > 0
              const isModerateProfit = performance.totalPnL > 0 && performance.totalPnL < 1000
              const isHighProfit = performance.totalPnL >= 1000
              const isLoss = performance.totalPnL < 0
              
              return (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
              <Card className="bg-card border-border hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                  isHighProfit ? 'bg-green-500' :
                  isModerateProfit ? 'bg-yellow-500' :
                  isLoss ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
                
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        {strategy.name}
                        {strategy.isActive && (
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge className={`mt-2 ${getCategoryColor(strategy.category)}`}>
                        {strategy.category}
                      </Badge>
                      
                      {/* Performance Badge */}
                      {performance.hasData && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className={
                            isLoss ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50' :
                            'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50'
                          }>
                            {isLoss ? (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            ) : null}
                            {isLoss ? 'Loss' : 'Active'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`text-muted-foreground hover:text-foreground transition-colors ${
                          strategy.isActive ? 'hover:bg-green-500/10' : 'hover:bg-gray-500/10'
                        }`}
                        onClick={() => toggleActive(strategy)}
                      >
                        {strategy.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditingStrategy(strategy); setShowEditModal(true) }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground line-clamp-2">
                    {strategy.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Performance Summary */}
                  {performance.hasData && (
                    <div className="rounded-lg p-3 mb-4 border bg-muted border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Total P&L</div>
                          <div className={`text-xl font-bold ${
                            performance.totalPnL < 0 ? 'text-red-600 dark:text-red-400' :
                            performance.totalPnL > 0 ? 'text-green-600 dark:text-green-400' :
                            'text-foreground'
                          }`}>
                            {performance.totalPnL >= 0 ? '+' : ''}₹{Math.abs(performance.totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Avg Daily</div>
                          <div className={`text-sm font-semibold ${
                            performance.avgDailyPnL < 0 ? 'text-red-600 dark:text-red-400' :
                            performance.avgDailyPnL > 0 ? 'text-green-600 dark:text-green-400' :
                            'text-muted-foreground'
                          }`}>
                            {performance.avgDailyPnL >= 0 ? '+' : ''}₹{Math.abs(performance.avgDailyPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Calculate metrics from historical data */}
                  {(() => {
                    // Parse historicalData - it might be a JSON string
                    let parsedHistoricalData = strategy.historicalData
                    if (typeof parsedHistoricalData === 'string') {
                      try {
                        parsedHistoricalData = JSON.parse(parsedHistoricalData)
                      } catch (e) {
                        parsedHistoricalData = null
                      }
                    }
                    
                    // Calculate from historical data if available
                    let tradesFromHistorical = 0
                    let winRateFromHistorical = 0
                    let profitFactorFromHistorical = 0
                    
                    if (parsedHistoricalData && parsedHistoricalData.entries && Array.isArray(parsedHistoricalData.entries)) {
                      const entries = parsedHistoricalData.entries
                      tradesFromHistorical = entries.length
                      
                      if (tradesFromHistorical > 0) {
                        // Calculate win rate from live P&L entries (count positive entries)
                        const liveEntries = entries.map((e: any) => {
                          const liveValue = parseFloat(String(e.live || '0')) || 0
                          return liveValue
                        })
                        
                        const winningEntries = liveEntries.filter((pnl: number) => pnl > 0).length
                        winRateFromHistorical = (winningEntries / tradesFromHistorical) * 100
                        
                        // Calculate profit factor from live data
                        const totalProfit = liveEntries.filter((pnl: number) => pnl > 0).reduce((sum: number, pnl: number) => sum + pnl, 0)
                        const totalLoss = Math.abs(liveEntries.filter((pnl: number) => pnl < 0).reduce((sum: number, pnl: number) => sum + pnl, 0))
                        profitFactorFromHistorical = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 999 : 0)
                      }
                    }
                    
                    // Use historical data if available, otherwise fall back to strategy stats from trades
                    const displayTrades = tradesFromHistorical > 0 ? tradesFromHistorical : (strategy.totalTrades || 0)
                    const displayWinRate = tradesFromHistorical > 0 ? winRateFromHistorical : (strategy.winRate || 0)
                    const displayProfitFactor = tradesFromHistorical > 0 ? profitFactorFromHistorical : (strategy.profitFactor || 0)
                    
                    return (
                      <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center rounded-lg p-3 bg-muted transition-colors">
                            <div className={`text-2xl font-bold ${
                              displayWinRate >= 60 ? 'text-green-600' :
                              displayWinRate >= 40 ? 'text-yellow-500' :
                              'text-red-600'
                            }`}>
                              {displayWinRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Strategy Win Rate</div>
                          </div>
                          <div className="text-center rounded-lg p-3 bg-muted transition-colors">
                            <div className="text-2xl font-bold text-foreground">
                              {displayProfitFactor.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">Profit Factor</div>
                          </div>
                        </div>
                        
                        {/* Additional Info */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 border-t pt-3">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {displayTrades} trades
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(strategy.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={() => { setEditingStrategy(strategy); setShowEditModal(true) }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={() => { setAnalyticsStrategy(strategy); setShowAnalyticsModal(true) }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-input text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={() => { setImportingStrategy(strategy); setShowImportModal(true) }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Data
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => deleteStrategy(strategy.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Add Strategy Modal */}
        <AddStrategyModal 
          open={showAddModal} 
          onOpenChange={setShowAddModal} 
          onSave={createStrategy}
        />

        {/* Edit Strategy Modal */}
        {editingStrategy && (
          <AddStrategyModal
            open={showEditModal}
            onOpenChange={(open) => { setShowEditModal(open); if (!open) setEditingStrategy(null) }}
            onSave={async (data) => {
              await updateStrategy(editingStrategy.id, data)
            }}
            initialData={editingStrategy}
            title="Edit Strategy"
            submitLabel="Save Changes"
          />
        )}

        {/* Import Historical Data Modal */}
        {importingStrategy && (
          <ImportDataModal
            open={showImportModal}
            onOpenChange={(open) => { setShowImportModal(open); if (!open) setImportingStrategy(null) }}
            strategyId={importingStrategy.id}
            strategy={importingStrategy}
            onSuccess={() => {
              fetchStrategies()
              setShowImportModal(false)
              setImportingStrategy(null)
            }}
          />
        )}

        {/* Strategy Analytics Modal */}
        {analyticsStrategy && (
          <StrategyAnalyticsModal
            open={showAnalyticsModal}
            onOpenChange={(open) => { setShowAnalyticsModal(open); if (!open) setAnalyticsStrategy(null) }}
            strategy={analyticsStrategy}
          />
        )}
      </div>
    </div>
  )
}

// Add Strategy Modal Component
function AddStrategyModal({ 
  open, 
  onOpenChange, 
  onSave,
  initialData,
  title = 'Add New Strategy',
  submitLabel = 'Save Strategy'
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (strategyData: any) => Promise<void>
  initialData?: any
  title?: string
  submitLabel?: string
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Breakout',
    rules: '',
    parameters: ''
  })
  const [saving, setSaving] = useState(false)

  // Populate when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'Breakout',
        rules: typeof initialData.rules === 'string' ? initialData.rules : (initialData.rules ? JSON.stringify(initialData.rules, null, 2) : ''),
        parameters: typeof initialData.parameters === 'string' ? initialData.parameters : (initialData.parameters ? JSON.stringify(initialData.parameters, null, 2) : '')
      })
    } else {
      setFormData({ name: '', description: '', category: 'Breakout', rules: '', parameters: '' })
    }
  }, [initialData, open])

  const handleSave = async () => {
    console.log('[AddStrategyModal] handleSave called', formData)
    
    if (!formData.name.trim()) {
      toast.error('Strategy name is required')
      return
    }

    try {
      setSaving(true)
      console.log('[AddStrategyModal] Calling onSave with data:', {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        rules: formData.rules,
        parameters: formData.parameters
      })
      
      await onSave({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        rules: formData.rules,
        parameters: formData.parameters
      })
      
      console.log('[AddStrategyModal] onSave completed successfully')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Breakout',
        rules: '',
        parameters: ''
      })
      onOpenChange(false)
      console.log('[AddStrategyModal] Modal closed')
    } catch (error) {
      console.error('[AddStrategyModal] Error saving strategy:', error)
      toast.error(`Failed to save strategy: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Strategy Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter strategy name"
              className="bg-background border-input text-foreground"
            />
          </div>
          
          <div>
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your strategy"
              className="bg-background border-input text-foreground"
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-foreground">Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 bg-background border border-input rounded text-foreground"
            >
              <option value="Breakout">Breakout</option>
              <option value="Trend">Trend</option>
              <option value="Mean Reversion">Mean Reversion</option>
              <option value="Scalping">Scalping</option>
              <option value="Swing">Swing</option>
              <option value="Directional Strategy">Directional Strategy</option>
              <option value="Non-Directional Strategy">Non-Directional Strategy</option>
              <option value="Reversal">Reversal</option>
            </select>
          </div>
          
          <div>
            <Label className="text-foreground">Trading Rules</Label>
            <Textarea
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Define your trading rules (e.g., Entry conditions, Exit conditions, Risk management)"
              className="bg-background border-input text-foreground"
              rows={4}
            />
          </div>
          
          <div>
            <Label className="text-foreground">Parameters</Label>
            <Textarea
              value={formData.parameters}
              onChange={(e) => setFormData(prev => ({ ...prev, parameters: e.target.value }))}
              placeholder="Strategy parameters (e.g., Stop loss: 2%, Take profit: 4%, Position size: 1%)"
              className="bg-background border-input text-foreground"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input text-muted-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('[AddStrategyModal] Save button clicked')
              handleSave()
            }}
            disabled={saving || !formData.name.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Import Data Modal Component
function ImportDataModal({ 
  open, 
  onOpenChange, 
  strategyId,
  strategy,
  onSuccess
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  strategyId: string
  strategy: any
  onSuccess: () => void
}) {
  const [tableData, setTableData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Load existing data when modal opens
  useEffect(() => {
    if (open) {
      if (strategy?.historicalData) {
        setTableData(strategy.historicalData)
      } else {
        // Initialize with empty structure if no existing data
        setTableData({
          title: strategy?.name || 'Historical Backtest vs Live Data',
          entries: [],
          total: { live: 0, backtest: 0 }
        })
      }
    } else {
      // Reset when modal closes
      setTableData(null)
    }
  }, [open, strategy])

  const handleTableDataChange = (data: any) => {
    console.log('[ImportDataModal] Data changed:', data)
    setTableData(data)
  }

  const handleSave = async () => {
    console.log('[ImportDataModal] handleSave called, tableData:', tableData)
    
    if (!tableData || !tableData.entries || tableData.entries.length === 0) {
      console.error('[ImportDataModal] No table data to save')
      toast.error('Please add at least one row of data first')
      return
    }

    try {
      setSaving(true)
      console.log('[ImportDataModal] Saving data:', tableData)

      // Update strategy with historical data
      // updateStrategyApi will handle getting the token from localStorage
      const result = await updateStrategyApi({ 
        id: strategyId, 
        historicalData: tableData 
      })
      
      console.log('[ImportDataModal] Strategy updated with historical data:', result)
      
      toast.success('Historical data saved successfully')
      onSuccess() // This will refresh the strategies list
      onOpenChange(false)
    } catch (error: any) {
      console.error('[ImportDataModal] Error saving data:', error)
      const errorMessage = error?.message || error?.error || 'Unknown error'
      toast.error(`Failed to save historical data: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Historical Backtest vs Live Data - {strategy?.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add and edit backtest vs live comparison data
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Interactive Table View - Always show */}
          <HistoricalDataTable 
            data={tableData || strategy?.historicalData} 
            onDataChange={handleTableDataChange}
            strategyName={strategy?.name}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input text-muted-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !tableData || !tableData.entries || tableData.entries.length === 0}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Save Data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
