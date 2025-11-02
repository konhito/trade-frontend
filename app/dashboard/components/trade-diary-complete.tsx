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
  Clock, 
  ArrowLeftRight, 
  Lightbulb, 
  Calendar, 
  Bot, 
  Hammer, 
  Handshake, 
  GraduationCap,
  Moon,
  ChevronDown,
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
  Brain,
  User
} from "lucide-react"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTradesStore } from '@/store/trades-store'
import { EnhancedTradeHistory } from './enhanced-trade-history'
import { useTheme } from '@/context/theme-provider'

// Market Header Component
function MarketHeader() {
  const { effectiveTheme } = useTheme()
  const [marketData, setMarketData] = useState([
    { name: 'Nifty Bank', change: 0.78, color: 'text-green-500' },
    { name: 'Nifty 50', change: 0.79, color: 'text-green-500' },
    { name: 'Nifty Realty', change: 1.75, color: 'text-green-500' },
    { name: 'Nifty Auto', change: 0.91, color: 'text-green-500' },
    { name: 'Nifty FMCG', change: 0.65, color: 'text-green-500' },
    { name: 'NIFTY HEALTHCARE', change: 1.2, color: 'text-green-500' },
  ])

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-2 md:space-x-6 overflow-x-auto scrollbar-thin">
        {marketData.map((market, index) => (
          <div key={index} className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-foreground text-xs md:text-sm font-medium">{market.name}</span>
            <span className={`text-xs md:text-sm font-bold ${market.color}`}>
              +{market.change}%
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hidden md:flex">
          <Moon className="w-4 h-4" />
        </Button>
        <div className="flex items-center space-x-2 text-foreground">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">UT</span>
          </div>
          <span className="text-sm font-medium hidden md:block">UnU tech</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

// Sidebar Component
function TradeDiarySidebar({ onItemClick }: { onItemClick?: () => void } = {}) {
  const { effectiveTheme } = useTheme()
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('trades')
  
  const navigationItems = [
    { name: 'Dashboard', icon: Clock, id: 'dashboard', path: '/dashboard' },
    { name: 'Trades', icon: ArrowLeftRight, id: 'trades', path: '/dashboard' },
    { name: 'Strategies', icon: Lightbulb, id: 'strategies', path: '/dashboard/strategies' },
    { name: 'Calendar', icon: Calendar, id: 'calendar', path: '/dashboard/calendar' },
    { name: 'AI Summarizer', icon: Bot, id: 'ai', path: '/dashboard/ai-summarizer' },
    { name: 'Tools', icon: Hammer, id: 'tools', path: '/dashboard/tools' },
    { name: 'Profile', icon: User, id: 'profile', path: '/dashboard/profile' },
  ]

  const handleItemClick = (item: any) => {
    setActiveItem(item.id)
    if (item.path) {
      router.push(item.path)
    }
    onItemClick?.()
  }

  return (
    <div className="w-64 h-screen bg-sidebar-background flex flex-col border-r border-sidebar-border hidden md:flex">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--chart-1))] to-[hsl(var(--chart-2))] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">TJ</span>
          </div>
          <span className="text-sidebar-foreground text-xl font-semibold">Trade Journal</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start text-left h-12 px-4 ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Button>
          )
        })}
      </nav>

    </div>
  )
}

// Trade History Table Component
function TradeHistoryTable() {
  const { trades } = useTradesStore()
  const [filteredTrades, setFilteredTrades] = useState(trades || [])
  const [showAddModal, setShowAddModal] = useState(false)

  // Mock data for demonstration
  const mockTrades = [
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
  ]

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
    <div className="flex-1 bg-gray-900 p-6">
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Trade History</h1>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm">
              <option>Default</option>
            </select>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter Trades
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync broker
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Trade
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DATE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SYMBOL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DIRECTION</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ENTRY/EXIT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">P/L (₹/%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RISK/REWARD</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">STRATEGY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">OUTCOME</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mockTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-750">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{trade.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{trade.symbol}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getDirectionColor(trade.direction)}>
                        {trade.direction}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>{trade.entryPrice} / {trade.exitPrice}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${trade.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.isProfit ? '+' : ''}₹{trade.pnl.toLocaleString()} ({trade.isProfit ? '+' : ''}{trade.pnlPercent}%)
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{trade.riskReward}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{trade.strategy}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getOutcomeColor(trade.outcome)}>
                        {trade.outcome}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState({
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Save trade logic here
    console.log('Saving trade:', formData)
    onOpenChange(false)
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Add New Trade</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="general" className="data-[state=active]:bg-gray-600">General</TabsTrigger>
            <TabsTrigger value="psychology" className="data-[state=active]:bg-gray-600">Psychology</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Trade Duration */}
            <div>
              <Label className="text-white font-medium">Trade Duration *</Label>
              <p className="text-gray-400 text-sm mb-3">Select whether this is an intraday or swing trade</p>
              <div className="flex space-x-4">
                <Button
                  variant={formData.tradeDuration === 'intraday' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('tradeDuration', 'intraday')}
                  className={formData.tradeDuration === 'intraday' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300'}
                >
                  Intraday
                </Button>
                <Button
                  variant={formData.tradeDuration === 'swing' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('tradeDuration', 'swing')}
                  className={formData.tradeDuration === 'swing' ? 'bg-blue-600 text-white' : 'border-gray-600 text-gray-300'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Swing
                </Button>
              </div>
            </div>

            {/* Trade Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Market type *</Label>
                <select
                  value={formData.marketType}
                  onChange={(e) => handleInputChange('marketType', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="Indian">Indian</option>
                  <option value="US">US</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>
              <div>
                <Label className="text-white">Symbol *</Label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="RELIANCE, NIFTY 50, etc."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Entry Date *</Label>
                <Input
                  value={formData.entryDate}
                  onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  placeholder="dd-mm-yyyy"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Entry Price *</Label>
                <Input
                  value={formData.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  placeholder="Entry Price"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Quantity *</Label>
                <Input
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Quantity"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Total amount *</Label>
                <Input
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                  placeholder="Amount"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Exit Price *</Label>
                <Input
                  value={formData.exitPrice}
                  onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                  placeholder="Exit Price"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Performance and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">P&L Amount *</Label>
                <Input
                  value={formData.pnlAmount}
                  onChange={(e) => handleInputChange('pnlAmount', e.target.value)}
                  placeholder="Amount"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">P&L (%) *</Label>
                <Input
                  value={formData.pnlPercent}
                  onChange={(e) => handleInputChange('pnlPercent', e.target.value)}
                  placeholder="% Change"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Direction */}
            <div>
              <Label className="text-white">Direction *</Label>
              <div className="flex space-x-4 mt-2">
                <Button
                  variant={formData.direction === 'Long' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('direction', 'Long')}
                  className={formData.direction === 'Long' ? 'bg-green-600 text-white' : 'border-gray-600 text-gray-300'}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Long
                </Button>
                <Button
                  variant={formData.direction === 'Short' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('direction', 'Short')}
                  className={formData.direction === 'Short' ? 'bg-red-600 text-white' : 'border-gray-600 text-gray-300'}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Short
                </Button>
              </div>
            </div>

            {/* Stop Loss and Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Stop Loss</Label>
                <Input
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  placeholder="Stop Loss"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Target</Label>
                <Input
                  value={formData.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  placeholder="Target"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Strategy and Outcome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Strategy</Label>
                <select
                  value={formData.strategy}
                  onChange={(e) => handleInputChange('strategy', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="">Select Strategy</option>
                  <option value="Breakout">Breakout</option>
                  <option value="Trend">Trend</option>
                  <option value="9&15 Ema">9&15 Ema</option>
                  <option value="Fibonacci retracement">Fibonacci retracement</option>
                </select>
              </div>
              <div>
                <Label className="text-white">Outcome Summary</Label>
                <select
                  value={formData.outcomeSummary}
                  onChange={(e) => handleInputChange('outcomeSummary', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
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
            <div className="text-center text-gray-400 py-8">
              Psychology tab content would go here
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Trade Journal Layout
export function TradeDiaryComplete() {
  const { effectiveTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <TradeDiarySidebar onItemClick={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Trade Journal</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
        
        {/* Market Header */}
        <MarketHeader />
        
        {/* Trade History Content */}
        <EnhancedTradeHistory />
      </div>
    </div>
  )
}
