'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus,
  Filter,
  RefreshCw,
  ExternalLink,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Search,
  Download,
  Upload,
  Brain
} from "lucide-react"
import { useState, useEffect } from 'react'
import { useTheme } from '@/context/theme-provider'

// Enhanced Trade History Table with exact styling from image
export function EnhancedTradeHistory() {
  const { effectiveTheme } = useTheme()
  const [trades, setTrades] = useState([
    {
      id: '1',
      date: '11 Aug 2025',
      symbol: 'BIOCON',
      direction: 'Short',
      entryPrice: 336.02,
      exitPrice: 331.66,
      pnl: 3139.2,
      pnlPercent: 1.30,
      riskReward: '1:2.95',
      strategy: 'Breakout',
      outcome: 'Full Success',
      isProfit: true
    },
    {
      id: '2',
      date: '25 Jul 2025',
      symbol: 'HDFCBANK-JUL2025-2040-PE',
      direction: 'Long',
      entryPrice: 38.15,
      exitPrice: 33.05,
      pnl: -5610,
      pnlPercent: -13.37,
      riskReward: '1:1',
      strategy: 'Trend',
      outcome: 'Mistake',
      isProfit: false
    },
    {
      id: '3',
      date: '25 Jul 2025',
      symbol: 'BANKNIFTY-JUL2025-57300-CE',
      direction: 'Long',
      entryPrice: 246.78,
      exitPrice: 219.75,
      pnl: -6622.35,
      pnlPercent: -10.95,
      riskReward: '1:1',
      strategy: '9&15 Ema',
      outcome: 'Mistake',
      isProfit: false
    },
    {
      id: '4',
      date: '25 Jul 2025',
      symbol: 'NIFTY-JUL2025-24900-PE',
      direction: 'Long',
      entryPrice: 104.45,
      exitPrice: 144.2,
      pnl: 14906.25,
      pnlPercent: 38.06,
      riskReward: '1:4.21',
      strategy: 'Trend',
      outcome: 'Full Success',
      isProfit: true
    },
    {
      id: '5',
      date: '24 Jul 2025',
      symbol: 'TRENT-JUL2025-5300-PE',
      direction: 'Long',
      entryPrice: 132.72,
      exitPrice: 140.25,
      pnl: 2259,
      pnlPercent: 5.67,
      riskReward: '1:2.02',
      strategy: 'Fibonacci retracement',
      outcome: 'Partial Success',
      isProfit: true
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTrades, setFilteredTrades] = useState(trades)

  useEffect(() => {
    const filtered = trades.filter(trade =>
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTrades(filtered)
  }, [searchTerm, trades])

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Full Success': return 'bg-green-600 text-white'
      case 'Mistake': return 'bg-red-600 text-white'
      case 'Partial Success': return 'bg-orange-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getDirectionColor = (direction: string) => {
    return direction === 'Long' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  }

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Trade History</h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-background border-input text-foreground placeholder-muted-foreground"
              />
            </div>
            <select className="px-3 py-2 bg-background border border-input rounded text-foreground text-sm">
              <option>Default</option>
              <option>Recent</option>
              <option>Profitable</option>
              <option>Losses</option>
            </select>
            <Button variant="outline" className="border-input text-muted-foreground hover:bg-accent">
              <Filter className="w-4 h-4 mr-2" />
              Filter Trades
            </Button>
            <Button variant="outline" className="border-input text-muted-foreground hover:bg-accent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync broker
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Trade
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Total Trades</div>
            <div className="text-2xl font-bold text-foreground">{trades.length}</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold text-green-500">
              {((trades.filter(t => t.isProfit).length / trades.length) * 100).toFixed(1)}%
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Total P&L</div>
            <div className={`text-2xl font-bold ${trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{trades.reduce((sum, t) => sum + t.pnl, 0).toLocaleString()}
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Best Trade</div>
            <div className="text-2xl font-bold text-green-500">
              ₹{Math.max(...trades.map(t => t.pnl)).toLocaleString()}
            </div>
          </Card>
        </div>

        {/* Trade History Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SYMBOL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">DIRECTION</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ENTRY/EXIT</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">P/L (₹/%)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">RISK/REWARD</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">STRATEGY</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">OUTCOME</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{trade.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{trade.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getDirectionColor(trade.direction)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {trade.direction}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div>Entry: ₹{trade.entryPrice}</div>
                        <div>Exit: ₹{trade.exitPrice}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${trade.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.isProfit ? '+' : ''}₹{trade.pnl.toLocaleString()} ({trade.isProfit ? '+' : ''}{trade.pnlPercent}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{trade.riskReward}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{trade.strategy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getOutcomeColor(trade.outcome)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {trade.outcome}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground p-2">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground p-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400 p-2">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTrades.length} of {trades.length} trades
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-input text-muted-foreground hover:bg-accent">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-input text-muted-foreground hover:bg-accent">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Trade Modal */}
      <AddTradeModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}

// Add New Trade Modal Component
function AddTradeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { effectiveTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const getTodayDate = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}-${month}-${year}`
  }

  const [formData, setFormData] = useState({
    tradeDuration: 'intraday',
    marketType: 'Indian',
    symbol: '',
    entryDate: getTodayDate(),
    entryPrice: '',
    quantity: '',
    totalAmount: '',
    exitPrice: '',
    pnlAmount: '',
    pnlPercent: '',
    direction: 'Long',
    stopLoss: '',
    target: '',
    strategy: '',
    outcomeSummary: ''
  })

  const calculatePnL = (entryPrice: string, exitPrice: string, quantity: string, direction: string) => {
    const entry = parseFloat(entryPrice)
    const exit = parseFloat(exitPrice)
    const qty = parseFloat(quantity)
    
    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) return { amount: '', percent: '' }
    
    const priceDiff = direction === 'Long' ? exit - entry : entry - exit
    const amount = priceDiff * qty
    const percent = (priceDiff / entry) * 100
    
    return {
      amount: amount.toFixed(2),
      percent: percent.toFixed(2)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate P&L when entry price, exit price, or quantity changes
      if (['entryPrice', 'exitPrice', 'quantity', 'direction'].includes(field)) {
        const pnl = calculatePnL(
          field === 'entryPrice' ? value : newData.entryPrice,
          field === 'exitPrice' ? value : newData.exitPrice,
          field === 'quantity' ? value : newData.quantity,
          field === 'direction' ? value : newData.direction
        )
        
        if (pnl.amount && pnl.percent) {
          newData.pnlAmount = pnl.amount
          newData.pnlPercent = pnl.percent
        }
      }
      
      return newData
    })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Required fields validation
    if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required'
    if (!formData.entryDate.trim()) newErrors.entryDate = 'Entry date is required'
    if (!formData.entryPrice.trim()) newErrors.entryPrice = 'Entry price is required'
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required'
    if (!formData.totalAmount.trim()) newErrors.totalAmount = 'Total amount is required'
    if (!formData.exitPrice.trim()) newErrors.exitPrice = 'Exit price is required'
    if (!formData.pnlAmount.trim()) newErrors.pnlAmount = 'P&L amount is required'
    if (!formData.pnlPercent.trim()) newErrors.pnlPercent = 'P&L percentage is required'

    // Date format validation
    if (formData.entryDate && !/^\d{2}-\d{2}-\d{4}$/.test(formData.entryDate)) {
      newErrors.entryDate = 'Date must be in dd-mm-yyyy format'
    }

    // Numeric validation
    if (formData.entryPrice && isNaN(Number(formData.entryPrice))) {
      newErrors.entryPrice = 'Entry price must be a number'
    }
    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a number'
    }
    if (formData.totalAmount && isNaN(Number(formData.totalAmount))) {
      newErrors.totalAmount = 'Total amount must be a number'
    }
    if (formData.exitPrice && isNaN(Number(formData.exitPrice))) {
      newErrors.exitPrice = 'Exit price must be a number'
    }
    if (formData.pnlAmount && isNaN(Number(formData.pnlAmount))) {
      newErrors.pnlAmount = 'P&L amount must be a number'
    }
    if (formData.pnlPercent && isNaN(Number(formData.pnlPercent))) {
      newErrors.pnlPercent = 'P&L percentage must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically call your API to save the trade
      console.log('Saving trade:', formData)
      
      // Show success message (you can use a toast notification here)
      alert('Trade saved successfully!')
      
      // Reset form and close modal
      handleReset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving trade:', error)
      alert('Error saving trade. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      tradeDuration: 'intraday',
      marketType: 'Indian',
      symbol: '',
      entryDate: '',
      entryPrice: '',
      quantity: '',
      totalAmount: '',
      exitPrice: '',
      pnlAmount: '',
      pnlPercent: '',
      direction: 'Long',
      stopLoss: '',
      target: '',
      strategy: '',
      outcomeSummary: ''
    })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-background border-border text-foreground shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-foreground">Add New Trade</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="general" className="data-[state=active]:bg-background flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              General
            </TabsTrigger>
            <TabsTrigger value="psychology" className="data-[state=active]:bg-background">Psychology</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('symbol', 'NIFTY')}
                className="text-xs"
              >
                NIFTY
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('symbol', 'BANKNIFTY')}
                className="text-xs"
              >
                BANKNIFTY
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('symbol', 'RELIANCE')}
                className="text-xs"
              >
                RELIANCE
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('strategy', 'Breakout')}
                className="text-xs"
              >
                Breakout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('strategy', 'Trend')}
                className="text-xs"
              >
                Trend
              </Button>
            </div>

            {/* Trade Duration */}
            <div>
              <Label className="text-foreground font-medium">Trade Duration *</Label>
              <p className="text-muted-foreground text-sm mb-3">Select whether this is an intraday or swing trade</p>
              <div className="flex space-x-4">
                <Button
                  variant={formData.tradeDuration === 'intraday' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('tradeDuration', 'intraday')}
                  className={`flex items-center gap-2 ${
                    formData.tradeDuration === 'intraday' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-input text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Intraday
                </Button>
                <Button
                  variant={formData.tradeDuration === 'swing' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('tradeDuration', 'swing')}
                  className={`flex items-center gap-2 ${
                    formData.tradeDuration === 'swing' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-input text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Swing
                </Button>
              </div>
            </div>

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Market type *</Label>
                <select
                  value={formData.marketType}
                  onChange={(e) => handleInputChange('marketType', e.target.value)}
                  className="w-full p-3 bg-background border border-input rounded text-foreground"
                >
                  <option value="Indian">Indian</option>
                  <option value="US">US</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Symbol *</Label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="RELIANCE, NIFTY 50, etc."
                  className={`bg-background border-input text-foreground ${errors.symbol ? 'border-red-500' : ''}`}
                />
                {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
              </div>
              <div>
                <Label className="text-foreground">Entry Date *</Label>
                <Input
                  value={formData.entryDate}
                  onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className={`bg-background border-input text-foreground ${errors.entryDate ? 'border-red-500' : ''}`}
                />
                {errors.entryDate && <p className="text-red-500 text-sm mt-1">{errors.entryDate}</p>}
              </div>
              <div>
                <Label className="text-foreground">Entry Price *</Label>
                <Input
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  placeholder="Entry Price"
                  className={`bg-background border-input text-foreground ${errors.entryPrice ? 'border-red-500' : ''}`}
                />
                {errors.entryPrice && <p className="text-red-500 text-sm mt-1">{errors.entryPrice}</p>}
              </div>
              <div>
                <Label className="text-foreground">Quantity *</Label>
                <Input
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Quantity"
                  className={`bg-background border-input text-foreground ${errors.quantity ? 'border-red-500' : ''}`}
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <Label className="text-foreground">Total amount *</Label>
                <Input
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  placeholder="Amount"
                  className={`bg-background border-input text-foreground ${errors.totalAmount ? 'border-red-500' : ''}`}
                />
                {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
              </div>
              <div>
                <Label className="text-foreground">Exit Price *</Label>
                <Input
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                  placeholder="Exit Price"
                  className={`bg-background border-input text-foreground ${errors.exitPrice ? 'border-red-500' : ''}`}
                />
                {errors.exitPrice && <p className="text-red-500 text-sm mt-1">{errors.exitPrice}</p>}
              </div>
            </div>

            {/* Performance and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">P&L Amount *</Label>
                <Input
                  value={formData.pnlAmount}
                  onChange={(e) => handleInputChange('pnlAmount', e.target.value)}
                  placeholder="Amount"
                  className={`bg-background border-input text-foreground ${errors.pnlAmount ? 'border-red-500' : ''}`}
                />
                {errors.pnlAmount && <p className="text-red-500 text-sm mt-1">{errors.pnlAmount}</p>}
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated from entry/exit prices</p>
              </div>
              <div>
                <Label className="text-foreground">P&L (%) *</Label>
                <Input
                  value={formData.pnlPercent}
                  onChange={(e) => handleInputChange('pnlPercent', e.target.value)}
                  placeholder="% Change"
                  className={`bg-background border-input text-foreground ${errors.pnlPercent ? 'border-red-500' : ''}`}
                />
                {errors.pnlPercent && <p className="text-red-500 text-sm mt-1">{errors.pnlPercent}</p>}
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated from entry/exit prices</p>
              </div>
            </div>

            {/* Direction */}
            <div>
              <Label className="text-foreground">Direction *</Label>
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

            {/* Stop Loss and Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Stop Loss</Label>
                <Input
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  placeholder="Stop Loss"
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground">Target</Label>
                <Input
                  value={formData.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  placeholder="Target"
                  className="bg-background border-input text-foreground"
                />
              </div>
            </div>

            {/* Strategy and Outcome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Strategy</Label>
                <select
                  value={formData.strategy}
                  onChange={(e) => handleInputChange('strategy', e.target.value)}
                  className="w-full p-3 bg-background border border-input rounded text-foreground"
                >
                  <option value="">Select Strategy</option>
                  <option value="Breakout">Breakout</option>
                  <option value="Trend">Trend</option>
                  <option value="9&15 Ema">9&15 Ema</option>
                  <option value="Fibonacci retracement">Fibonacci retracement</option>
                </select>
              </div>
              <div>
                <Label className="text-foreground">Outcome Summary</Label>
                <select
                  value={formData.outcomeSummary}
                  onChange={(e) => handleInputChange('outcomeSummary', e.target.value)}
                  className="w-full p-3 bg-background border border-input rounded text-foreground"
                >
                  <option value="">Select Outcome Summary</option>
                  <option value="Full Success">Full Success</option>
                  <option value="Partial Success">Partial Success</option>
                  <option value="Mistake">Mistake</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="psychology" className="space-y-6 mt-6">
            <div className="text-center text-muted-foreground py-8">
              <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">Psychology Analysis</h3>
              <p className="text-muted-foreground">Track your emotional state and decision-making process</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="border-input text-muted-foreground hover:bg-accent disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Trade
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
