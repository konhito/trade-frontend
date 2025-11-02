'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getYear, format, startOfYear, eachDayOfInterval, getMonth, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Award, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'

interface YearCalendarProps {
  calendarData: Record<string, { pnl: number; tradeNumber: number; trades: any[]; strategies?: Set<string> | string[] }>
}

export default function YearCalendar({ calendarData }: YearCalendarProps) {
  const { effectiveTheme } = useTheme()
  const [currentYear, setCurrentYear] = React.useState(getYear(new Date()))

  const yearStart = startOfYear(new Date(currentYear, 0, 1))
  const yearEnd = new Date(currentYear, 11, 31)

  const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd })

  // Group days by month
  const monthData = useMemo(() => {
    const months = Array.from({ length: 12 }, () => ({
      days: [] as Date[],
      monthName: '',
      monthIndex: 0
    }))

    daysInYear.forEach(day => {
      const monthIndex = day.getMonth()
      const dateString = format(day, 'yyyy-MM-dd')
      
      months[monthIndex].days.push(day)
      months[monthIndex].monthIndex = monthIndex

      // Set month name (only once per month)
      if (months[monthIndex].monthName === '') {
        months[monthIndex].monthName = format(day, 'MMM').toUpperCase()
      }
    })

    return months
  }, [daysInYear])

  const getDayColor = (day: Date): string => {
    const dateString = format(day, 'yyyy-MM-dd')
    const dayData = calendarData[dateString]

    if (!dayData || dayData.pnl === 0 || !dayData.pnl) {
      return 'bg-gray-100 dark:bg-gray-800'
    }

    const pnl = dayData.pnl

    // Green for profits - different intensities with better tints
    if (pnl > 0) {
      if (pnl >= 50000) return 'bg-green-700 dark:bg-green-800'
      if (pnl >= 20000) return 'bg-green-600 dark:bg-green-700'
      if (pnl >= 10000) return 'bg-green-500 dark:bg-green-600'
      if (pnl >= 5000) return 'bg-green-400 dark:bg-green-500'
      if (pnl >= 2000) return 'bg-green-300 dark:bg-green-400'
      if (pnl >= 1000) return 'bg-green-200 dark:bg-green-300'
      return 'bg-green-100 dark:bg-green-200'
    } 
    // Red for losses - different intensities with better tints
    else {
      const absPnL = Math.abs(pnl)
      if (absPnL >= 50000) return 'bg-red-700 dark:bg-red-800'
      if (absPnL >= 20000) return 'bg-red-600 dark:bg-red-700'
      if (absPnL >= 10000) return 'bg-red-500 dark:bg-red-600'
      if (absPnL >= 5000) return 'bg-red-400 dark:bg-red-500'
      if (absPnL >= 2000) return 'bg-red-300 dark:bg-red-400'
      if (absPnL >= 1000) return 'bg-red-200 dark:bg-red-300'
      return 'bg-red-100 dark:bg-red-200'
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const days = Object.keys(calendarData).map(date => ({
      date,
      ...calendarData[date]
    }))

    // Find longest profitable streak
    let currentStreak = 0
    let maxStreak = 0
    let streakStart = ''
    let streakEnd = ''
    let currentStreakStart = ''

    days.sort((a, b) => a.date.localeCompare(b.date))

    days.forEach((day, index) => {
      if (day.pnl > 0) {
        if (currentStreak === 0) {
          currentStreakStart = day.date
        }
        currentStreak++
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
          streakEnd = day.date
          streakStart = currentStreakStart
        }
      } else {
        currentStreak = 0
      }
    })

    // Find most profitable day
    const mostProfitableDay = days.reduce((max, day) => 
      day.pnl > max.pnl ? day : max, 
      { pnl: -Infinity, date: '' }
    )

    return { maxStreak, streakStart, streakEnd, mostProfitableDay }
  }, [calendarData])

  const totalYearPnL = Object.values(calendarData).reduce((sum, day) => sum + day.pnl, 0)

  return (
    <div className="space-y-6">
      {/* Top Metrics Section */}
      <div className="flex gap-6">
        <Card className="flex-1 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray={`${(stats.maxStreak / 30) * 175} 175`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Longest streak</p>
                <p className="text-xs text-muted-foreground">
                  {stats.streakStart && stats.streakEnd && (
                    <>
                      {format(new Date(stats.streakStart), 'MMM d, yyyy')} - {format(new Date(stats.streakEnd), 'MMM d, yyyy')}
                    </>
                  )}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.maxStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-card border-border">
          <CardContent className="p-6">
            <div className="border-l-2 border-gray-300 pl-6">
              <p className="text-sm font-medium text-muted-foreground">Most profitable day</p>
              {stats.mostProfitableDay.date && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(stats.mostProfitableDay.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stats.mostProfitableDay.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year Calendar Grid */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4">
          <CardTitle className="text-xl font-bold">{currentYear}</CardTitle>
          <div className="flex items-center gap-4">
            <div className={cn(
              "text-lg font-semibold",
              totalYearPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              ₹{Math.abs(totalYearPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentYear(currentYear - 1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentYear(currentYear + 1)}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Twelve month grids in a row */}
          <div className="flex gap-2 items-end justify-between">
            {monthData.map((month, index) => {
              // Get the first day of the month
              const firstDay = month.days[0]
              const firstDayOfWeek = firstDay.getDay() // 0 = Sunday
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  {/* Month grid */}
                  <div className="w-full grid grid-cols-7 gap-[2px]">
                    {/* Empty cells for days before the first day of month */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-full pb-[100%]" />
                    ))}
                    
                    {/* Days of the month */}
                    {month.days.map((day) => {
                      const color = getDayColor(day)
                      const dateString = format(day, 'yyyy-MM-dd')
                      const dayData = calendarData[dateString]
                      const pnl = dayData?.pnl || 0
                      
                      return (
                        <div
                          key={format(day, 'yyyy-MM-dd')}
                          className={cn(
                            "w-full pb-[100%] rounded-sm cursor-pointer relative group",
                            color,
                            "hover:ring-2 hover:ring-primary hover:z-10"
                          )}
                          title={`${format(day, 'MMM d, yyyy')}: ₹${pnl.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        />
                      )
                    })}
                  </div>
                  
                  {/* Month label */}
                  <span className="text-[10px] font-medium text-foreground mt-2 uppercase">
                    {month.monthName}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex items-center justify-center gap-8 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100" />
              <span className="text-muted-foreground">Less</span>
            </div>
            <div className="flex items-center gap-1">
              {['bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'].map((color) => (
                <div key={color} className={cn("w-[11px] h-[11px] rounded-[2px]", color)} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">More</span>
              <span className="text-green-600 font-semibold">Profit</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100" />
              <span className="text-muted-foreground">Less</span>
            </div>
            <div className="flex items-center gap-1">
              {['bg-red-200', 'bg-red-400', 'bg-red-600', 'bg-red-800'].map((color) => (
                <div key={color} className={cn("w-[11px] h-[11px] rounded-[2px]", color)} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">More</span>
              <span className="text-red-600 font-semibold">Loss</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100" />
              <span className="text-muted-foreground">No data</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

