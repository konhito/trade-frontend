'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Plus, Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Entry {
  date: string
  day: string
  live: string
  backtest: string
  lotSize: string
  deployedCapital: string
  note: string
}

interface HistoricalData {
  title: string
  entries: Entry[]
  total: {
    live: number
    backtest: number
    lotSize: number
  }
}

interface HistoricalDataTableProps {
  data?: any
  onDataChange?: (data: HistoricalData) => void
  strategyName?: string
}

export function HistoricalDataTable({ data: initialData, onDataChange, strategyName }: HistoricalDataTableProps) {
  const [data, setData] = useState<HistoricalData | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [openDatePicker, setOpenDatePicker] = useState<number | null>(null)

  // Initialize with either database data or empty state
  useEffect(() => {
    if (!initialized) {
      let newData: HistoricalData
      
      if (initialData && initialData.entries && initialData.entries.length > 0) {
        // Use data from database
        const entries = initialData.entries.map((e: any) => ({
          date: e.date || '',
          day: e.day || '',
          live: String(e.live || ''),
          backtest: String(e.backtest || ''),
          lotSize: String(e.lotSize || ''),
          deployedCapital: String(e.deployedCapital || e.deployedDate || ''), // Migrate from deployedDate if exists
          note: e.note || '-'
        }))
        
        // Recalculate totals from entries
        const totalLive = entries.reduce((sum, e) => sum + (parseFloat(e.live) || 0), 0)
        const totalBacktest = entries.reduce((sum, e) => sum + (parseFloat(e.backtest) || 0), 0)
        const totalLotSize = entries.reduce((sum, e) => sum + (parseFloat(e.lotSize) || 0), 0)
        
        newData = {
          title: initialData.title || strategyName || 'Historical Backtest vs Live Data',
          entries,
          total: { live: totalLive, backtest: totalBacktest, lotSize: totalLotSize }
        }
      } else {
        // Create empty state for new data
        newData = {
          title: strategyName || 'Historical Backtest vs Live Data',
          entries: [],
          total: { live: 0, backtest: 0, lotSize: 0 }
        }
      }
      
      setData(newData)
      setInitialized(true)
      
      // Notify parent of initial data
      if (onDataChange) {
        onDataChange(newData)
      }
    }
  }, [initialData, strategyName, initialized, onDataChange])

  useEffect(() => {
    if (onDataChange && data) {
      onDataChange(data)
    }
  }, [data, onDataChange])

  const addRow = () => {
    if (!data) return
    setData(prev => prev ? {
      ...prev,
      entries: [...prev.entries, { date: '', day: '', live: '', backtest: '', lotSize: '', deployedCapital: '', note: '-' }],
      total: { live: prev.total.live, backtest: prev.total.backtest, lotSize: prev.total.lotSize }
    } : null)
  }

  const deleteRow = (index: number) => {
    if (!data) return
    setData(prev => {
      if (!prev) return null
      const newEntries = prev.entries.filter((_, i) => i !== index)
      const totalLive = newEntries.reduce((sum, e) => sum + (parseFloat(e.live) || 0), 0)
      const totalBacktest = newEntries.reduce((sum, e) => sum + (parseFloat(e.backtest) || 0), 0)
      const totalLotSize = newEntries.reduce((sum, e) => sum + (parseFloat(e.lotSize) || 0), 0)
      return {
        ...prev,
        entries: newEntries,
        total: { live: totalLive, backtest: totalBacktest, lotSize: totalLotSize }
      }
    })
  }

  const updateEntry = (index: number, field: keyof Entry, value: string) => {
    if (!data) return
    setData(prev => {
      if (!prev) return null
      const newEntries = [...prev.entries]
      newEntries[index][field] = value
      
      // Recalculate totals
      const totalLive = newEntries.reduce((sum, e) => sum + (parseFloat(e.live) || 0), 0)
      const totalBacktest = newEntries.reduce((sum, e) => sum + (parseFloat(e.backtest) || 0), 0)
      const totalLotSize = newEntries.reduce((sum, e) => sum + (parseFloat(e.lotSize) || 0), 0)
      
      return { 
        ...prev, 
        entries: newEntries,
        total: { live: totalLive, backtest: totalBacktest, lotSize: totalLotSize }
      }
    })
  }

  const handleDateSelect = (date: Date | undefined, rowIndex: number) => {
    if (!date || !data) return
    
    const formattedDate = format(date, 'yyyy-MM-dd')
    const dayName = format(date, 'EEE').toUpperCase()
    
    setData(prev => {
      if (!prev) return null
      const newEntries = [...prev.entries]
      newEntries[rowIndex].date = formattedDate
      newEntries[rowIndex].day = dayName
      
      // Recalculate totals
      const totalLive = newEntries.reduce((sum, e) => sum + (parseFloat(e.live) || 0), 0)
      const totalBacktest = newEntries.reduce((sum, e) => sum + (parseFloat(e.backtest) || 0), 0)
      const totalLotSize = newEntries.reduce((sum, e) => sum + (parseFloat(e.lotSize) || 0), 0)
      
      return {
        ...prev,
        entries: newEntries,
        total: { live: totalLive, backtest: totalBacktest, lotSize: totalLotSize }
      }
    })
    
    setOpenDatePicker(null)
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
        <Input
          value={data.title}
          onChange={(e) => {
            const newData = { ...data, title: e.target.value }
            setData(newData)
            if (onDataChange) onDataChange(newData)
          }}
          className="bg-background border-input"
          placeholder="Enter title for this data"
        />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="bg-muted w-12 text-center font-bold">#</TableHead>
              <TableHead className="bg-muted font-bold">Date</TableHead>
              <TableHead className="bg-muted font-bold">Day</TableHead>
              <TableHead className="bg-muted text-right font-bold">Live P&L</TableHead>
              <TableHead className="bg-muted text-right font-bold">Backtest P&L</TableHead>
              <TableHead className="bg-muted text-right font-bold">Lot Size</TableHead>
              <TableHead className="bg-muted text-right font-bold">Deployed Capital</TableHead>
              <TableHead className="bg-muted font-bold">Note</TableHead>
              <TableHead className="bg-muted w-20 text-center font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No data yet. Click "Add Row" to start adding data.
                </TableCell>
              </TableRow>
            ) : (
              data.entries.map((entry, idx) => {
              const liveNum = parseFloat(entry.live) || 0
              const backtestNum = parseFloat(entry.backtest) || 0
              
              const isLiveProfit = liveNum >= 0
              const isBacktestProfit = backtestNum >= 0
              
              return (
                <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                  <TableCell className="p-1">
                    <div className="flex items-center gap-1">
                      <Input
                        value={entry.date}
                        onChange={(e) => updateEntry(idx, 'date', e.target.value)}
                        className="h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring flex-1"
                        placeholder="Date"
                      />
                      <Popover open={openDatePicker === idx} onOpenChange={(open) => setOpenDatePicker(open ? idx : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={entry.date ? new Date(entry.date) : undefined}
                            onSelect={(date) => handleDateSelect(date, idx)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={entry.day}
                      onChange={(e) => updateEntry(idx, 'day', e.target.value)}
                      className="h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring w-20 font-medium"
                      placeholder="Day"
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right">
                    <Input
                      value={entry.live}
                      onChange={(e) => updateEntry(idx, 'live', e.target.value)}
                      className={`h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring text-right font-semibold ${
                        liveNum < 0 ? 'text-red-600 dark:text-red-400' : 
                        'text-foreground'
                      }`}
                      placeholder="0"
                      type="number"
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right">
                    <Input
                      value={entry.backtest}
                      onChange={(e) => updateEntry(idx, 'backtest', e.target.value)}
                      className={`h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring text-right font-semibold ${
                        backtestNum < 0 ? 'text-red-600 dark:text-red-400' : 
                        'text-foreground'
                      }`}
                      placeholder="0"
                      type="number"
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right">
                    <Input
                      value={entry.lotSize}
                      onChange={(e) => updateEntry(idx, 'lotSize', e.target.value)}
                      className="h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring text-right"
                      placeholder="0"
                      type="number"
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right">
                    <Input
                      value={entry.deployedCapital}
                      onChange={(e) => updateEntry(idx, 'deployedCapital', e.target.value)}
                      className="h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring text-right"
                      placeholder="0"
                      type="number"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    <Input
                      value={entry.note}
                      onChange={(e) => updateEntry(idx, 'note', e.target.value)}
                      className="h-8 border-input bg-background focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Note"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRow(idx)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            }))}
            
             {/* Total Row */}
             <TableRow className="font-bold border-t-2 bg-muted/30">
               <TableCell colSpan={3} className="text-lg font-bold">
                 Total
               </TableCell>
               <TableCell className={`text-right text-lg font-bold ${
                 data.total.live < 0 ? 'text-red-600 dark:text-red-400' : 
                 data.total.live > 0 ? 'text-green-600 dark:text-green-400' : 
                 'text-foreground'
               }`}>
                 {data.total.live >= 0 ? '+' : ''}{data.total.live.toLocaleString()}
               </TableCell>
               <TableCell className={`text-right text-lg font-bold ${
                 data.total.backtest < 0 ? 'text-red-600 dark:text-red-400' : 
                 data.total.backtest > 0 ? 'text-green-600 dark:text-green-400' : 
                 'text-foreground'
               }`}>
                 {data.total.backtest >= 0 ? '+' : ''}{data.total.backtest.toLocaleString()}
               </TableCell>
               <TableCell className="text-right text-lg font-bold">
                 {data.total.lotSize.toLocaleString()}
               </TableCell>
               <TableCell></TableCell>
               <TableCell colSpan={2}></TableCell>
             </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            if (!data) return
            const today = new Date()
            const formattedDate = format(today, 'yyyy-MM-dd')
            const dayName = format(today, 'EEE').toUpperCase()
            
            setData(prev => prev ? {
              ...prev,
              entries: [...prev.entries, { 
                date: formattedDate, 
                day: dayName, 
                live: '', 
                backtest: '', 
                lotSize: '', 
                deployedCapital: '', 
                note: '-' 
              }],
              total: { live: prev.total.live, backtest: prev.total.backtest, lotSize: prev.total.lotSize }
            } : null)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Today's Row
        </Button>
        <Button onClick={addRow} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>
    </div>
  )
}

