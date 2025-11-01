'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Globe,
  Newspaper,
  Calendar,
  DollarSign
} from "lucide-react"
import { useState, useEffect } from 'react'

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
}

interface NewsItem {
  title: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  timestamp: string
  source: string
}

// Mock data - in real app, this would come from APIs
const mockMarketData: MarketData[] = [
  { symbol: 'SPY', price: 445.67, change: 2.34, changePercent: 0.53, volume: 45678900, sentiment: 'bullish' },
  { symbol: 'QQQ', price: 378.92, change: -1.23, changePercent: -0.32, volume: 23456700, sentiment: 'bearish' },
  { symbol: 'IWM', price: 198.45, change: 0.87, changePercent: 0.44, volume: 12345600, sentiment: 'neutral' },
  { symbol: 'VIX', price: 18.23, change: -0.45, changePercent: -2.41, volume: 8901230, sentiment: 'bullish' },
]

const mockNews: NewsItem[] = [
  {
    title: "Fed Signals Potential Rate Cut in Q2",
    summary: "Federal Reserve officials hint at possible interest rate reduction amid economic concerns...",
    sentiment: 'positive',
    timestamp: '2 hours ago',
    source: 'Reuters'
  },
  {
    title: "Tech Stocks Rally on AI Optimism",
    summary: "Major technology companies see significant gains following positive AI sector outlook...",
    sentiment: 'positive',
    timestamp: '4 hours ago',
    source: 'Bloomberg'
  },
  {
    title: "Inflation Data Shows Mixed Signals",
    summary: "Latest inflation figures present conflicting indicators for market direction...",
    sentiment: 'neutral',
    timestamp: '6 hours ago',
    source: 'CNBC'
  },
  {
    title: "Energy Sector Faces Headwinds",
    summary: "Oil prices decline as demand concerns mount in global markets...",
    sentiment: 'negative',
    timestamp: '8 hours ago',
    source: 'WSJ'
  }
]

function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>(mockMarketData)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time price updates
        setMarketData(prev => prev.map(item => ({
          ...item,
          price: item.price + (Math.random() - 0.5) * 0.5,
          change: item.change + (Math.random() - 0.5) * 0.1,
          changePercent: item.changePercent + (Math.random() - 0.5) * 0.05
        })))
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isLive])

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market Overview</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-400">{isLive ? 'Live' : 'Paused'}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsLive(!isLive)}
            className="text-gray-400 hover:text-white"
          >
            <Activity className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((item, index) => (
          <div key={index} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{item.symbol}</span>
              <Badge 
                variant="secondary" 
                className={`${
                  item.sentiment === 'bullish' ? 'bg-green-600 text-white' :
                  item.sentiment === 'bearish' ? 'bg-red-600 text-white' :
                  'bg-gray-600 text-white'
                }`}
              >
                {item.sentiment}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${item.price.toFixed(2)}
            </div>
            <div className={`flex items-center text-sm ${
              item.change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {item.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Vol: {(item.volume / 1000000).toFixed(1)}M
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>(mockNews)

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market News</h3>
        <Button size="sm" variant="outline" className="text-gray-300 border-gray-600">
          <Newspaper className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="p-4 bg-gray-700 rounded-lg border-l-4 border-gray-600">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-white text-sm">{item.title}</h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  item.sentiment === 'positive' ? 'bg-green-600 text-white' :
                  item.sentiment === 'negative' ? 'bg-red-600 text-white' :
                  'bg-gray-600 text-white'
                }`}
              >
                {item.sentiment}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-2">{item.summary}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.source}</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function EconomicCalendar() {
  const events = [
    { time: '09:30', event: 'CPI Data Release', impact: 'High', currency: 'USD' },
    { time: '10:00', event: 'Fed Chair Speech', impact: 'High', currency: 'USD' },
    { time: '14:00', event: 'FOMC Minutes', impact: 'Medium', currency: 'USD' },
    { time: '15:30', event: 'Oil Inventory Data', impact: 'Medium', currency: 'USD' },
  ]

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Economic Calendar</h3>
        <Button size="sm" variant="outline" className="text-gray-300 border-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          Full Calendar
        </Button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-blue-500 font-mono text-sm">{event.time}</div>
              <div>
                <div className="text-white text-sm font-medium">{event.event}</div>
                <div className="text-gray-400 text-xs">{event.currency}</div>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`${
                event.impact === 'High' ? 'bg-red-600 text-white' :
                event.impact === 'Medium' ? 'bg-yellow-600 text-white' :
                'bg-gray-600 text-white'
              }`}
            >
              {event.impact}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function MarketSentiment() {
  return (
    <div className="space-y-6">
      <MarketOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketNews />
        <EconomicCalendar />
      </div>
    </div>
  )
}

