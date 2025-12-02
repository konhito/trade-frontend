'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trade } from '@/lib/types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Brain,
  Edit,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight
} from "lucide-react"
import { useTheme } from '@/context/theme-provider'
import { useAuth } from '@/context/auth-provider'
import { useData } from '@/context/data-provider'
import { useEffect } from 'react'
import { listTrades, createTrade, updateTrade, deleteTrade } from '@/lib/services/trades'
import PeriodStatisticsComponent from '../components/statistics/period-statistics'
import FullStatisticsDialog from '../components/statistics/full-statistics-dialog'

export default function TradesPage() {
  const { effectiveTheme } = useTheme()
  const { user, isLoading: authLoading } = useAuth()
  const { refreshTrades } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterStrategy, setFilterStrategy] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [useDatabase, setUseDatabase] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)

  // Load trades from database
  useEffect(() => {
    if (authLoading) {
      console.log('[Trades] Waiting for auth to load...')
      return
    }
    
    if (!user?.id) {
      console.warn('[Trades] No user ID available, cannot load trades')
      setLoading(false)
      return
    }
    
    console.log('[Trades] User available, loading trades for userId:', user.id)
    loadTrades()
  }, [user?.id, authLoading])

  // Load trades from database with silent refresh option
  const loadTrades = async (silent = false) => {
    if (!user?.id) {
      console.warn('[Trades] Cannot load trades: no user ID')
      if (!silent) setLoading(false)
      return
    }
    
    if (!silent) setLoading(true)
    
    try {
      const userId = String(user.id)
      console.log('[Trades] Loading trades for userId:', userId)
      
      const data = await listTrades({
        userId,
        ...(filterStatus !== 'All' && { status: filterStatus }),
        ...(filterStrategy !== 'All' && { strategy: filterStrategy })
      })
      
      // Filter by search term on client side if needed
      let filteredTrades = data.trades || []
      if (searchTerm) {
        filteredTrades = filteredTrades.filter((trade: any) =>
          trade.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      console.log('Trades loaded:', filteredTrades)
      setTrades(filteredTrades)
      if (initialLoad) setInitialLoad(false)
    } catch (error) {
      console.error('Error loading trades:', error)
      setTrades([])
    } finally {
      setLoading(false)
    }
  }

  // Load trades when filters change - silent if not initial load
  useEffect(() => {
    if (!user?.id || authLoading) return // Wait for auth
    
    if (useDatabase && !initialLoad) {
      loadTrades(true)
    } else if (useDatabase && initialLoad) {
      loadTrades(false)
    }
  }, [searchTerm, filterStatus, filterStrategy, user?.id, authLoading])

  // Add Trade Modal Form Data
  const [formData, setFormData] = useState({
    symbol: '',
    direction: 'Long',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    strategy: '',
    duration: 'Intraday',
    stopLoss: '',
    targetProfit: '',
    convenienceFee: '',
    notes: '',
    psychology: {
      emotion: 'Confident',
      confidence: 8,
      stress: 3,
      notes: ''
    }
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('psychology.')) {
      const psychField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        psychology: {
          ...prev.psychology,
          [psychField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const calculatePnL = () => {
    const entry = parseFloat(formData.entryPrice) || 0
    const exit = parseFloat(formData.exitPrice) || 0
    const qty = parseInt(formData.quantity) || 0
    const multiplier = formData.direction === 'Long' ? 1 : -1
    
    if (entry > 0 && exit > 0 && qty > 0) {
      const pnl = (exit - entry) * qty * multiplier
      const pnlPercent = ((exit - entry) / entry) * 100 * multiplier
      return { pnl: pnl.toFixed(2), pnlPercent: pnlPercent.toFixed(2) }
    }
    return { pnl: '0.00', pnlPercent: '0.00' }
  }

  const handleAddTrade = async () => {
    // Validate required fields
    if (!formData.symbol || !formData.entryPrice || !formData.quantity) {
      alert('Please fill in all required fields: Symbol, Entry Price, and Quantity')
      return
    }
    
    // Ensure user is authenticated
    if (!user?.id) {
      alert('You must be logged in to create trades')
      return
    }

    const pnlData = calculatePnL()
    const userId = String(user.id)
    
    console.log('[Trades] Adding trade for userId:', userId)
    console.log('[Trades] Trade data:', formData)
    
    // Save to database
    setLoading(true)
    try {
      const tradeData = {
        userId,
        symbol: formData.symbol,
        direction: formData.direction,
        entryPrice: formData.entryPrice,
        exitPrice: formData.exitPrice,
        quantity: formData.quantity,
        entryDate: formData.entryDate,
        exitDate: formData.exitDate,
        strategy: formData.strategy,
        duration: formData.duration,
        stopLoss: formData.stopLoss || null,
        targetProfit: formData.targetProfit || null,
        convenienceFee: formData.convenienceFee || null,
        notes: formData.notes,
        psychology: formData.psychology,
        status: formData.exitDate ? 'Closed' : 'Open'
      }
      
      const data = await createTrade(tradeData)
      console.log('Trade created successfully:', data.trade)
      setTrades(prev => [data.trade, ...prev])
      setShowAddModal(false)
      resetForm()
      // Reload trades locally
      loadTrades()
      // Refresh global trades data for dashboard and other components
      if (refreshTrades) {
        await refreshTrades(true)
      }
    } catch (error: any) {
      console.error('Error saving trade:', error)
      alert(`Error saving trade: ${error.message || 'Please check your connection.'}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      symbol: '',
      direction: 'Long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      entryDate: new Date().toISOString().split('T')[0],
      exitDate: '',
      strategy: '',
      duration: 'Intraday',
      stopLoss: '',
      targetProfit: '',
      convenienceFee: '',
      notes: '',
      psychology: {
        emotion: 'Confident',
        confidence: 8,
        stress: 3,
        notes: ''
      }
    })
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    resetForm()
    setActiveTab('general')
  }

  // View trade handler
  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setShowViewModal(true)
  }

  // Edit trade handler
  const handleEditTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setFormData({
      symbol: trade.symbol || '',
      direction: trade.direction || 'Long',
      entryPrice: typeof trade.entryPrice === 'string' ? trade.entryPrice : (trade.entryPrice?.toString() || ''),
      exitPrice: typeof trade.exitPrice === 'string' ? trade.exitPrice : (trade.exitPrice?.toString() || ''),
      quantity: trade.quantity?.toString() || '',
      entryDate: trade.entryDate || '',
      exitDate: trade.exitDate || '',
      strategy: trade.strategy || '',
      duration: trade.duration || 'Intraday',
      stopLoss: (trade as any).stopLoss?.toString() || '',
      targetProfit: (trade as any).targetProfit?.toString() || '',
      convenienceFee: (trade as any).convenienceFee?.toString() || '',
      notes: trade.notes || '',
      psychology: (typeof trade.psychology === 'object' && trade.psychology !== null) 
        ? trade.psychology 
        : {
            emotion: 'Confident',
            confidence: 8,
            stress: 3,
            notes: ''
          }
    })
    setShowEditModal(true)
  }

  // Delete trade handler
  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      return
    }

    try {
      await deleteTrade(tradeId)
      // Remove trade from local state
      setTrades(prevTrades => prevTrades.filter(trade => trade.id !== tradeId))
      // Refresh global trades data for dashboard and other components
      if (refreshTrades) {
        await refreshTrades(true)
      }
      alert('Trade deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting trade:', error)
      alert(`Error deleting trade: ${error.message || 'Please check your connection.'}`)
    }
  }

  // Update trade handler
  const handleUpdateTrade = async () => {
    if (!selectedTrade) return

    setLoading(true)
    try {
      const updateData = {
        id: selectedTrade.id,
        ...formData,
        status: formData.exitDate ? 'Closed' : 'Open'
      }
      
      const data = await updateTrade(updateData)
      console.log('[Trades] Trade updated successfully:', data.trade)
      
      // Update trade in local state
      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === selectedTrade.id ? data.trade : trade
        )
      )
      
      // Reload trades to get fresh data from backend
      await loadTrades(true)
      
      // Refresh global trades data for dashboard and other components
      if (refreshTrades) {
        await refreshTrades(true)
      }
      
      setShowEditModal(false)
      alert('Trade updated successfully!')
    } catch (error: any) {
      console.error('Error updating trade:', error)
      alert(`Error updating trade: ${error.message || 'Please check your connection.'}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = (trade.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = filterStatus === 'All' || trade.status === filterStatus
    const matchesStrategy = filterStrategy === 'All' || trade.strategy === filterStrategy
    return matchesSearch && matchesStatus && matchesStrategy
  })

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0)
  const winRate = trades.filter(trade => trade.pnl > 0).length / trades.length * 100
  const totalTrades = trades.length
  const openTrades = trades.filter(trade => trade.status === 'Open').length

  // Export trades to CSV
  const exportTrades = () => {
    if (trades.length === 0) {
      alert('No trades to export')
      return
    }

    const headers = [
      'Symbol',
      'Direction', 
      'Entry Price',
      'Exit Price',
      'Quantity',
      'Entry Date',
      'Exit Date',
      'Strategy',
      'Status',
      'P&L',
      'P&L %',
      'Notes'
    ]

    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        trade.symbol || '',
        trade.direction || '',
        trade.entryPrice || '',
        trade.exitPrice || '',
        trade.quantity || '',
        trade.entryDate || '',
        trade.exitDate || '',
        trade.strategy || '',
        trade.status || '',
        trade.pnl || '',
        trade.pnlPercent || '',
        (trade.notes || '').replace(/,/g, ';') // Replace commas in notes
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Force refresh function
  const handleRefresh = () => {
    console.log('Refresh button clicked')
    setLoading(true)
    loadTrades(false) // Force non-silent refresh
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Trades</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage and track your trading performance</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
              <FullStatisticsDialog />
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={exportTrades}
                className="flex items-center gap-2 text-xs sm:text-sm" 
                size="sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add New Trade</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6 pb-20">
        {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-lg sm:text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{totalPnL.toLocaleString()}
                </p>
              </div>
              {totalPnL >= 0 ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Win Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-500">{winRate.toFixed(1)}%</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">W</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Trades</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-500">{totalTrades}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">T</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Open Trades</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-500">{openTrades}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">O</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStrategy} onValueChange={setFilterStrategy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Strategies</SelectItem>
                <SelectItem value="Breakout">Breakout</SelectItem>
                <SelectItem value="Trend Following">Trend Following</SelectItem>
                <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                <SelectItem value="Non-Directional">Non-Directional</SelectItem>
                <SelectItem value="Reversal">Reversal</SelectItem>
                <SelectItem value="Scalping">Scalping</SelectItem>
                <SelectItem value="Swing">Swing</SelectItem>
                <SelectItem value="Directional Strategy">Directional Strategy</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
              ) : filteredTrades.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">No trades found</p>
                    <p className="text-sm">Start by adding your first trade</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      User ID: {user?.id ? String(user.id) : 'Not logged in'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Your First Trade
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleRefresh}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTrades.map((trade) => (
              <div key={trade.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    {trade.direction === 'Long' ? (
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                    <span className="font-semibold text-foreground text-sm sm:text-base">{trade.symbol}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Badge variant={trade.status === 'Open' ? 'default' : 'secondary'} className="text-xs">
                      {trade.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{trade.strategy}</Badge>
                    <Badge variant="outline" className="text-xs">{trade.duration}</Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <div className="text-left sm:text-right">
                    <div className={`font-semibold text-sm sm:text-base ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{trade.pnl.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground">
                    <div>Entry: ₹{trade.entryPrice}</div>
                    {trade.exitPrice > 0 && <div>Exit: ₹{trade.exitPrice}</div>}
                    <div>Qty: {trade.quantity}</div>
                  </div>
                  
                  <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground">
                    <div>{trade.entryDate}</div>
                    {trade.exitDate && <div>{trade.exitDate}</div>}
                  </div>
                  
                  <div className="flex items-center justify-end sm:justify-start space-x-1 sm:space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewTrade(trade)}
                      title="View Trade Details"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTrade(trade)}
                      title="Edit Trade"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      onClick={() => handleDeleteTrade(trade.id)}
                      title="Delete Trade"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period Statistics Section */}
      <PeriodStatisticsComponent />

      {/* Add Trade Modal */}
      <Dialog open={showAddModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-border text-foreground shadow-2xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col w-[95vw] sm:w-full mx-4 sm:mx-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-foreground">Add New Trade</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="general" className="data-[state=active]:bg-background flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                General
              </TabsTrigger>
              <TabsTrigger value="psychology" className="data-[state=active]:bg-background flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Psychology
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., NIFTY 50, RELIANCE"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Direction</Label>
                    <div className="flex space-x-4 mt-2">
                      <Button
                        variant={formData.direction === 'Long' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('direction', 'Long')}
                        className={`flex items-center gap-2 ${
                          formData.direction === 'Long' 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'border-input text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Long
                      </Button>
                      <Button
                        variant={formData.direction === 'Short' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('direction', 'Short')}
                        className={`flex items-center gap-2 ${
                          formData.direction === 'Short' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'border-input text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        Short
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="entryPrice">Entry Price *</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.entryPrice}
                      onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="exitPrice">Exit Price</Label>
                    <Input
                      id="exitPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.exitPrice}
                      onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.stopLoss}
                      onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetProfit">Target Profit</Label>
                    <Input
                      id="targetProfit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.targetProfit}
                      onChange={(e) => handleInputChange('targetProfit', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="convenienceFee">Convenience Fee</Label>
                    <Input
                      id="convenienceFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.convenienceFee}
                      onChange={(e) => handleInputChange('convenienceFee', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select value={formData.strategy} onValueChange={(value) => handleInputChange('strategy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Non-Directional">Non-Directional</SelectItem>
                        <SelectItem value="Directional Strategy">Directional Strategy</SelectItem>
                        <SelectItem value="Reversal">Reversal</SelectItem>
                        <SelectItem value="Scalping">Scalping</SelectItem>
                        <SelectItem value="Swing">Swing</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Trade Duration</Label>
                    <div className="flex space-x-4 mt-2">
                      <Button
                        variant={formData.duration === 'intraday' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('duration', 'Intraday')}
                        className={`flex items-center gap-2 ${
                          formData.duration === 'Intraday' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'border-input text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        Intraday
                      </Button>
                      <Button
                        variant={formData.duration === 'swing' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('duration', 'Swing')}
                        className={`flex items-center gap-2 ${
                          formData.duration === 'Swing' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'border-input text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        Swing
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="entryDate">Entry Date</Label>
                    <Input
                      id="entryDate"
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => handleInputChange('entryDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exitDate">Exit Date (Optional)</Label>
                    <Input
                      id="exitDate"
                      type="date"
                      value={formData.exitDate}
                      onChange={(e) => handleInputChange('exitDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Trade notes, observations, lessons learned..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* P&L Calculation Display */}
              {formData.entryPrice && formData.exitPrice && formData.quantity && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">P&L Calculation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">P&L: </span>
                      <span className={`font-semibold ${calculatePnL().pnl.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                        ₹{calculatePnL().pnl}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P&L %: </span>
                      <span className={`font-semibold ${calculatePnL().pnlPercent.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                        {calculatePnL().pnlPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="psychology" className="space-y-6 mt-6">
              <div className="text-center text-muted-foreground py-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">Psychology Analysis</h3>
                <p className="text-muted-foreground">Track your emotional state and decision-making process</p>
              </div>
            </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTrade} 
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Trade'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Trade Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
            <DialogDescription>
              View complete trade information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrade && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Symbol</Label>
                    <p className="text-lg font-semibold">{selectedTrade.symbol}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Direction</Label>
                    <div className="flex items-center space-x-2">
                      {selectedTrade.direction === 'Long' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">{selectedTrade.direction}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedTrade.status === 'Open' ? 'default' : 'secondary'}>
                      {selectedTrade.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Strategy</Label>
                    <p className="font-medium">{selectedTrade.strategy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="font-medium">{selectedTrade.duration}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Entry Price</Label>
                    <p className="text-lg font-semibold">₹{selectedTrade.entryPrice}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Exit Price</Label>
                    <p className="text-lg font-semibold">₹{selectedTrade.exitPrice || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Stop Loss</Label>
                    <p className="text-lg font-semibold">₹{(selectedTrade as any).stopLoss || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Target Profit</Label>
                    <p className="text-lg font-semibold">₹{(selectedTrade as any).targetProfit || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                    <p className="text-lg font-semibold">{selectedTrade.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">P&L</Label>
                    <p className={`text-lg font-semibold ${selectedTrade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{selectedTrade.pnl.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">P&L %</Label>
                    <p className={`text-lg font-semibold ${selectedTrade.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedTrade.pnlPercent >= 0 ? '+' : ''}{selectedTrade.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Entry Date</Label>
                  <p className="font-medium">{selectedTrade.entryDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Exit Date</Label>
                  <p className="font-medium">{selectedTrade.exitDate || 'N/A'}</p>
                </div>
              </div>
              
              {selectedTrade.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedTrade.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowViewModal(false)
                  handleEditTrade(selectedTrade)
                }}>
                  Edit Trade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Trade Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col w-[95vw] sm:w-full mx-4 sm:mx-0">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>
              Update trade information
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="psychology">Psychology</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6 mt-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="edit-symbol">Symbol *</Label>
                    <Input
                      id="edit-symbol"
                      placeholder="e.g., AAPL, TSLA"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-direction">Direction *</Label>
                    <Select value={formData.direction} onValueChange={(value) => handleInputChange('direction', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Long">Long</SelectItem>
                        <SelectItem value="Short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-entry-price">Entry Price *</Label>
                    <Input
                      id="edit-entry-price"
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      value={formData.entryPrice}
                      onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-exit-price">Exit Price</Label>
                    <Input
                      id="edit-exit-price"
                      type="number"
                      step="0.01"
                      placeholder="155.00"
                      value={formData.exitPrice}
                      onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-stop-loss">Stop Loss</Label>
                    <Input
                      id="edit-stop-loss"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.stopLoss}
                      onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-target-profit">Target Profit</Label>
                    <Input
                      id="edit-target-profit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.targetProfit}
                      onChange={(e) => handleInputChange('targetProfit', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-quantity">Quantity *</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      placeholder="10"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-commission">Commission</Label>
                    <Input
                      id="edit-commission"
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={(formData as any).commission || ''}
                      onChange={(e) => handleInputChange('commission', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-convenienceFee">Convenience Fee</Label>
                    <Input
                      id="edit-convenienceFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.convenienceFee}
                      onChange={(e) => handleInputChange('convenienceFee', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-entry-date">Entry Date *</Label>
                    <Input
                      id="edit-entry-date"
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => handleInputChange('entryDate', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-exit-date">Exit Date</Label>
                    <Input
                      id="edit-exit-date"
                      type="date"
                      value={formData.exitDate}
                      onChange={(e) => handleInputChange('exitDate', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-strategy">Strategy</Label>
                    <Input
                      id="edit-strategy"
                      placeholder="e.g., Momentum, Reversal"
                      value={formData.strategy}
                      onChange={(e) => handleInputChange('strategy', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-duration">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Intraday">Intraday</SelectItem>
                        <SelectItem value="Swing">Swing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      placeholder="Trade notes, observations, lessons learned..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="psychology" className="space-y-6 mt-6 flex-1 overflow-y-auto">
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Psychology Analysis</h3>
                  <p className="text-muted-foreground">Track your emotional state and decision-making process</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTrade}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Trade'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
