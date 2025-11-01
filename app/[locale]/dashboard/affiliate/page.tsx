'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ExternalLink,
  Copy,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  Handshake,
  Link as LinkIcon,
  BarChart3
} from "lucide-react"
import { useState } from 'react'
import { useTheme } from '@/context/theme-provider'

export default function AffiliatePage() {
  const { effectiveTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Mock data for affiliate links
  const [affiliates, setAffiliates] = useState([
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
    },
    {
      id: '2',
      title: 'Interactive Brokers',
      description: 'Low-cost brokerage with access to global markets and advanced trading tools',
      url: 'https://interactivebrokers.com?ref=yourcode',
      category: 'Broker',
      isActive: true,
      clicks: 189,
      conversions: 8,
      earnings: 320.00,
      commission: 40.00,
      createdAt: '2024-01-10',
      lastUsed: '2024-01-19'
    },
    {
      id: '3',
      title: 'Trading Psychology Course',
      description: 'Master your emotions and improve your trading performance',
      url: 'https://psychologycourse.com?ref=yourcode',
      category: 'Education',
      isActive: true,
      clicks: 156,
      conversions: 15,
      earnings: 450.75,
      commission: 30.05,
      createdAt: '2024-01-08',
      lastUsed: '2024-01-18'
    },
    {
      id: '4',
      title: 'Market Data Feed',
      description: 'Real-time market data and news feed for professional traders',
      url: 'https://marketdata.com?ref=yourcode',
      category: 'Data',
      isActive: false,
      clicks: 78,
      conversions: 3,
      earnings: 90.25,
      commission: 30.08,
      createdAt: '2024-01-05',
      lastUsed: '2024-01-15'
    },
    {
      id: '5',
      title: 'Trading Journal App',
      description: 'Track and analyze your trading performance with detailed analytics',
      url: 'https://tradingjournal.com?ref=yourcode',
      category: 'Software',
      isActive: true,
      clicks: 134,
      conversions: 9,
      earnings: 135.60,
      commission: 15.07,
      createdAt: '2024-01-12',
      lastUsed: '2024-01-17'
    },
    {
      id: '6',
      title: 'Options Trading Course',
      description: 'Learn advanced options strategies and risk management techniques',
      url: 'https://optionscourse.com?ref=yourcode',
      category: 'Education',
      isActive: true,
      clicks: 98,
      conversions: 6,
      earnings: 180.00,
      commission: 30.00,
      createdAt: '2024-01-03',
      lastUsed: '2024-01-16'
    }
  ])

  const categories = ['All', 'Broker', 'Software', 'Education', 'Data', 'Tools']

  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = affiliate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || affiliate.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Broker': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Software': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Education': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Data': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Tools': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Broker': return <DollarSign className="w-4 h-4" />
      case 'Software': return <BarChart3 className="w-4 h-4" />
      case 'Education': return <TrendingUp className="w-4 h-4" />
      case 'Data': return <LinkIcon className="w-4 h-4" />
      case 'Tools': return <Handshake className="w-4 h-4" />
      default: return <Handshake className="w-4 h-4" />
    }
  }

  const totalEarnings = affiliates.reduce((sum, affiliate) => sum + affiliate.earnings, 0)
  const totalClicks = affiliates.reduce((sum, affiliate) => sum + affiliate.clicks, 0)
  const totalConversions = affiliates.reduce((sum, affiliate) => sum + affiliate.conversions, 0)
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : '0.00'

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Affiliate Links</h1>
            <p className="text-muted-foreground">Manage your affiliate partnerships and track performance</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search affiliates..."
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Earnings</div>
              <div className="text-2xl font-bold text-green-500">${totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Clicks</div>
              <div className="text-2xl font-bold text-foreground">{totalClicks}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Conversions</div>
              <div className="text-2xl font-bold text-blue-500">{totalConversions}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-2xl font-bold text-purple-500">{conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAffiliates.map((affiliate) => (
            <Card key={affiliate.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground">{affiliate.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getCategoryColor(affiliate.category)}>
                        {getCategoryIcon(affiliate.category)}
                        <span className="ml-1">{affiliate.category}</span>
                      </Badge>
                      <Badge className={affiliate.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                        {affiliate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={affiliate.isActive}
                      onCheckedChange={(checked) => {
                        setAffiliates(prev => prev.map(a => 
                          a.id === affiliate.id ? { ...a, isActive: checked } : a
                        ))
                      }}
                    />
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  {affiliate.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{affiliate.clicks}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{affiliate.conversions}</div>
                    <div className="text-xs text-muted-foreground">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-500">${affiliate.earnings.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">${affiliate.commission.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  <div>Created: {affiliate.createdAt}</div>
                  <div>Last used: {affiliate.lastUsed}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 border-input text-muted-foreground hover:bg-accent">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Affiliate Modal */}
        <AddAffiliateModal open={showAddModal} onOpenChange={setShowAddModal} />
      </div>
    </div>
  )
}

// Add Affiliate Modal Component
function AddAffiliateModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Software',
    commission: ''
  })

  const handleSave = () => {
    console.log('Saving affiliate:', formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Add New Affiliate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Affiliate Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter affiliate title"
              className="bg-background border-input text-foreground"
            />
          </div>
          
          <div>
            <Label className="text-foreground">Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the affiliate product or service"
              className="bg-background border-input text-foreground"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Category *</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 bg-background border border-input rounded text-foreground"
              >
                <option value="Broker">Broker</option>
                <option value="Software">Software</option>
                <option value="Education">Education</option>
                <option value="Data">Data</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
            
            <div>
              <Label className="text-foreground">Commission ($)</Label>
              <Input
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                placeholder="0.00"
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-foreground">Affiliate URL *</Label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com?ref=yourcode"
              className="bg-background border-input text-foreground"
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
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Handshake className="w-4 h-4 mr-2" />
            Add Affiliate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

