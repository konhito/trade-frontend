'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  Bell,
  Repeat,
  BarChart3,
  TrendingDown,
  Activity,
  Loader2
} from "lucide-react"
import { useState, useEffect } from 'react'
import { useTheme } from '@/context/theme-provider'
import { useData } from '@/context/data-provider'
import { useAuth } from '@/context/auth-provider'
import CalendarPnl from '../components/calendar/desktop-calendar'
import YearCalendar from '../components/calendar/year-calendar'
import { CalendarData } from './types/calendar'
import { toast } from 'sonner'

export default function CalendarPage() {
  const { effectiveTheme } = useTheme()
  const { session } = useAuth()
  const { calendarData, statistics, loading } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('All')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'calendar' | 'events' | 'year'>('calendar')

  const types = ['All', 'Economic Event', 'Earnings', 'Market Open', 'Personal', 'Holiday']

  // Calculate calendar statistics
  const calendarStats = {
    totalDays: Object.keys(calendarData || {}).length,
    profitableDays: Object.values(calendarData || {}).filter(day => day.pnl > 0).length,
    losingDays: Object.values(calendarData || {}).filter(day => day.pnl < 0).length,
    totalPnL: Object.values(calendarData || {}).reduce((sum, day) => sum + day.pnl, 0),
    bestDay: Object.entries(calendarData || {}).reduce((best, [date, day]) => 
      day.pnl > best.pnl ? { date, ...day } : best, { date: '', pnl: -Infinity }
    ),
    worstDay: Object.entries(calendarData || {}).reduce((worst, [date, day]) => 
      day.pnl < worst.pnl ? { date, ...day } : worst, { date: '', pnl: Infinity }
    )
  }

  const winRate = calendarStats.totalDays > 0 ? (calendarStats.profitableDays / calendarStats.totalDays) * 100 : 0

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Economic Event': return <TrendingUp className="w-4 h-4" />
      case 'Earnings': return <DollarSign className="w-4 h-4" />
      case 'Market Open': return <Target className="w-4 h-4" />
      case 'Personal': return <CalendarIcon className="w-4 h-4" />
      case 'Holiday': return <AlertCircle className="w-4 h-4" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'High': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'Medium': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'Low': return <CalendarIcon className="w-4 h-4 text-green-500" />
      default: return <CalendarIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="flex-1 bg-background p-3 sm:p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading Calendar</h1>
            <p className="text-muted-foreground">Track your daily P&L, MTM, and trading performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Month
            </Button>
            <Button 
              variant={viewMode === 'year' ? 'default' : 'outline'}
              onClick={() => setViewMode('year')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Year
            </Button>
            <Button 
              variant={viewMode === 'events' ? 'default' : 'outline'}
              onClick={() => setViewMode('events')}
            >
              <Bell className="w-4 h-4 mr-2" />
              Events
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-input text-foreground placeholder-muted-foreground"
            />
          </div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded text-foreground text-sm"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background border-input text-foreground"
          />
          <Button variant="outline" className="border-input text-muted-foreground hover:bg-accent">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Trading Days</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-foreground">{calendarStats.totalDays}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Profitable Days</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-green-500">{calendarStats.profitableDays}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Win Rate</div>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-blue-500">{`${winRate.toFixed(1)}%`}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total P&L</div>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className={`text-2xl font-bold ${calendarStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${calendarStats.totalPnL.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Best Day</div>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-green-500">${calendarStats.bestDay.pnl.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Worst Day</div>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="text-2xl font-bold text-red-500">${calendarStats.worstDay.pnl.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {viewMode === 'calendar' ? (
          <div className="h-[600px]">
            {loading ? (
              <Card className="bg-card border-border h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : calendarData ? (
              <CalendarPnl calendarData={calendarData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Data</h3>
                  <p className="text-muted-foreground">Start trading to see your daily P&L calendar</p>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'year' ? (
          <div>
            {loading ? (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <Skeleton className="h-96 w-full rounded" />
                </CardContent>
              </Card>
            ) : calendarData ? (
              <YearCalendar calendarData={calendarData} />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Data</h3>
                  <p className="text-muted-foreground">Start trading to see your yearly calendar</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Events Coming Soon</h3>
              <p className="text-muted-foreground">Economic events and market announcements will be displayed here</p>
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        <AddEventModal open={showAddModal} onOpenChange={setShowAddModal} />
      </div>
    </div>
  )
}

// Add Event Modal Component
function AddEventModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Personal',
    date: '',
    time: '',
    timezone: 'EST',
    importance: 'Medium',
    isRecurring: false,
    reminder: true
  })

  const handleSave = () => {
    console.log('Saving event:', formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Add New Event</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Event Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              className="bg-background border-input text-foreground"
            />
          </div>
          
          <div>
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the event"
              className="bg-background border-input text-foreground"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground">Event Type *</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 bg-background border border-input rounded text-foreground"
              >
                <option value="Economic Event">Economic Event</option>
                <option value="Earnings">Earnings</option>
                <option value="Market Open">Market Open</option>
                <option value="Personal">Personal</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            
            <div>
              <Label className="text-foreground">Importance *</Label>
              <select
                value={formData.importance}
                onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value }))}
                className="w-full p-3 bg-background border border-input rounded text-foreground"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-foreground">Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-background border-input text-foreground"
              />
            </div>
            
            <div>
              <Label className="text-foreground">Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="bg-background border-input text-foreground"
              />
            </div>
            
            <div>
              <Label className="text-foreground">Timezone</Label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full p-3 bg-background border border-input rounded text-foreground"
              >
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="GMT">GMT</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="rounded border-input"
              />
              <Label htmlFor="isRecurring" className="text-foreground">Recurring Event</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.reminder}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.checked }))}
                className="rounded border-input"
              />
              <Label htmlFor="reminder" className="text-foreground">Set Reminder</Label>
            </div>
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
            <CalendarIcon className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

