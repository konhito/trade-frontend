'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Sparkles, 
  FileText,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  Lock,
  CheckCircle2,
  Download,
  RefreshCw,
  Copy
} from "lucide-react"
import { useAuth } from '@/context/auth-provider'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })
const Charts = dynamic(() => import('./Charts'), { ssr: false })

export default function AISummarizerPage() {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<Record<string, number>>({})
  const [generatedSummaries, setGeneratedSummaries] = useState<Record<string, string>>({})
  const [tradesData, setTradesData] = useState<any[]>([])
  const [statsData, setStatsData] = useState({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    avgPnL: 0
  })
  const [loadingData, setLoadingData] = useState(true)

  // Load last generated times from localStorage on mount (but not old summaries)
  useEffect(() => {
    const stored = localStorage.getItem('ai-summarizer-last-generated')
    if (stored) {
      try {
        setLastGenerated(JSON.parse(stored))
      } catch (e) {
        console.error('Error parsing last generated times:', e)
      }
    }
    
    // Don't load old summaries - always generate fresh
    // Clear any existing summaries from localStorage
    localStorage.removeItem('ai-summarizer-responses')
    setGeneratedSummaries({})
  }, [])

  // Fetch trades data on component mount
  useEffect(() => {
    const fetchTradesData = async () => {
      try {
        setLoadingData(true)
        const response = await fetch('/api/trades')
        if (response.ok) {
          const data = await response.json()
          setTradesData(data.trades || [])
          
          // Calculate stats
          const totalTrades = data.trades?.length || 0
          const winningTrades = data.trades?.filter((t: any) => t.pnl > 0).length || 0
          const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
          const totalPnL = data.trades?.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) || 0
          const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0
          
          setStatsData({
            totalTrades,
            winRate,
            totalPnL,
            avgPnL
          })
        }
      } catch (error) {
        console.error('Error fetching trades:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchTradesData()
  }, [])

  // Check if 24 hours have passed
  const canGenerate = (type: string) => {
    if (!lastGenerated[type]) return true
    const now = Date.now()
    const lastGen = lastGenerated[type]
    const hoursSince = (now - lastGen) / (1000 * 60 * 60)
    return hoursSince >= 24
  }

  // Get time until next generation is allowed
  const getTimeUntilNext = (type: string) => {
    if (!lastGenerated[type]) return null
    const now = Date.now()
    const lastGen = lastGenerated[type]
    const hoursSince = (now - lastGen) / (1000 * 60 * 60)
    const hoursRemaining = 24 - hoursSince
    
    if (hoursRemaining > 0) {
      const hours = Math.floor(hoursRemaining)
      const minutes = Math.floor((hoursRemaining - hours) * 60)
      return { hours, minutes }
    }
    return null
  }

  const summaryTypes = [
    {
      id: 'daily',
      title: 'Daily Summary',
      description: 'AI-powered analysis of your daily trading performance',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      id: 'strategy',
      title: 'Strategy Review',
      description: 'Comprehensive analysis of your trading strategies',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'market',
      title: 'Market Analysis',
      description: 'AI-generated market insights and outlook',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      id: 'risk',
      title: 'Risk Analysis',
      description: 'Risk assessment and recommendations',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ]

  const handleGenerateSummary = async (type: string) => {
    // Check if generation is allowed
    if (!canGenerate(type)) {
      const timeUntil = getTimeUntilNext(type)
      if (timeUntil) {
        toast.error(`You can only generate this summary once every 24 hours. Wait ${timeUntil.hours}h ${timeUntil.minutes}m`)
      }
      return
    }

    setLoading(true)
    setSelectedType(type)
    
    try {
      // Get token from localStorage if not in context
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
      
      if (!authToken) {
        toast.error('Please sign in to generate summaries')
        return
      }

      // Call Gemini API
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type,
          userData: {
            userId: user?.id,
            timestamp: new Date().toISOString(),
          }
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Get error message from response
        const errorMessage = data.error || 'Failed to generate summary'
        
        // Show specific error messages
        if (response.status === 413) {
          toast.error('Too much data to process. The daily summary will only include today\'s trades.')
        } else if (response.status === 408) {
          toast.error('Generation took too long. Please try again.')
        } else if (response.status === 401) {
          toast.error('Please sign in to generate summaries')
        } else {
          toast.error(errorMessage)
        }
        throw new Error(errorMessage)
      }
      const summary = data.summary
      
      // Save generated summary
      const newSummaries = {
        ...generatedSummaries,
        [type]: summary
      }
      setGeneratedSummaries(newSummaries)
      localStorage.setItem('ai-summarizer-responses', JSON.stringify(newSummaries))
      
      // Save current timestamp for this type
      const newLastGenerated = {
        ...lastGenerated,
        [type]: Date.now()
      }
      setLastGenerated(newLastGenerated)
      localStorage.setItem('ai-summarizer-last-generated', JSON.stringify(newLastGenerated))
      
      toast.success(`${summaryTypes.find(t => t.id === type)?.title || 'Summary'} generated successfully!`)
    } catch (error: any) {
      console.error('Error generating summary:', error)
      // Only show generic error if we haven't already shown a specific one
      if (!error.message || !error.message.includes('Failed to generate')) {
        toast.error(error.message || 'Failed to generate summary. Please try again later.')
      }
    } finally {
      setLoading(false)
      setSelectedType(null)
    }
  }

  const handleCopySummary = (summary: string, type: string) => {
    navigator.clipboard.writeText(summary)
    toast.success(`${summaryTypes.find(t => t.id === type)?.title || 'Summary'} copied to clipboard!`)
  }

  const handleDownloadSummary = async (summary: string, type: string) => {
    try {
      // Dynamically import jsPDF (client-side only)
      const { jsPDF } = await import('jspdf')
      
      const summaryType = summaryTypes.find(t => t.id === type)
      const filename = `ai-summary-${summaryType?.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      
      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageHeight = doc.internal.pageSize.height
      const pageWidth = doc.internal.pageSize.width
      const margin = 20
      const maxWidth = pageWidth - (margin * 2)
      const lineHeight = 7
      let y = margin

      // Add title
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text(summaryType?.title || 'AI Summary', margin, y)
      y += 10

      // Add date
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(128, 128, 128)
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y)
      y += 10

      // Process markdown line by line
      const lines = summary.split('\n')
      
      lines.forEach((line: string) => {
        // Check if we need a new page
        if (y > pageHeight - margin - lineHeight) {
          doc.addPage()
          y = margin
        }

        // Remove markdown syntax and format
        let processedLine = line.trim()
        
        // Handle headings
        if (processedLine.match(/^###/)) {
          // H3 - Sub-subheading
          doc.setFontSize(12)
          doc.setFont(undefined, 'bold')
          processedLine = processedLine.replace(/^###+\s*/, '').replace(/\*\*/g, '')
          const textLines = doc.splitTextToSize(processedLine, maxWidth)
          textLines.forEach((text: string) => {
            if (y > pageHeight - margin - lineHeight) {
              doc.addPage()
              y = margin
            }
            doc.text(text, margin, y)
            y += 6
          })
          y += 3
          doc.setFontSize(11)
          doc.setFont(undefined, 'normal')
        } else if (processedLine.match(/^##/)) {
          // H2 - Subheading
          doc.setFontSize(14)
          doc.setFont(undefined, 'bold')
          processedLine = processedLine.replace(/^##+\s*/, '').replace(/\*\*/g, '')
          const textLines = doc.splitTextToSize(processedLine, maxWidth)
          textLines.forEach((text: string) => {
            if (y > pageHeight - margin - lineHeight) {
              doc.addPage()
              y = margin
            }
            doc.text(text, margin, y)
            y += 7
          })
          y += 5
          doc.setFontSize(11)
          doc.setFont(undefined, 'normal')
        } else if (processedLine.match(/^#/)) {
          // H1 - Main heading
          doc.setFontSize(16)
          doc.setFont(undefined, 'bold')
          processedLine = processedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '')
          const textLines = doc.splitTextToSize(processedLine, maxWidth)
          textLines.forEach((text: string) => {
            if (y > pageHeight - margin - lineHeight) {
              doc.addPage()
              y = margin
            }
            doc.text(text, margin, y)
            y += 8
          })
          y += 5
          doc.setFontSize(11)
          doc.setFont(undefined, 'normal')
        } else if (processedLine.match(/^[-*+•]\s+/) || processedLine.match(/^\d+\.\s+/)) {
          // List item
          processedLine = processedLine.replace(/^[-*+•]\s+/, '• ').replace(/^\d+\.\s+/, '• ')
          processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
          const textLines = doc.splitTextToSize(processedLine, maxWidth - 10)
          textLines.forEach((text: string, idx: number) => {
            if (y > pageHeight - margin - lineHeight) {
              doc.addPage()
              y = margin
            }
            doc.text(text, margin + (idx === 0 ? 5 : 10), y)
            y += lineHeight
          })
        } else if (processedLine.match(/^---/)) {
          // Horizontal rule - add some space
          y += 5
        } else if (processedLine.match(/^\|/)) {
          // Table row - skip tables for now (complex to format)
          // Could enhance later
          return
        } else if (processedLine) {
          // Regular text
          // Remove markdown formatting but keep content
          processedLine = processedLine
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.+?)\*/g, '$1') // Remove italic
            .replace(/`(.+?)`/g, '$1') // Remove code
            .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
          
          const textLines = doc.splitTextToSize(processedLine, maxWidth)
          textLines.forEach((text: string) => {
            if (y > pageHeight - margin - lineHeight) {
              doc.addPage()
              y = margin
            }
            doc.text(text, margin, y)
            y += lineHeight
          })
        } else {
          // Empty line
          y += lineHeight / 2
        }
        
        doc.setTextColor(0, 0, 0) // Reset to black
      })

      // Save PDF
      doc.save(filename)
      toast.success(`Downloaded ${summaryType?.title || 'summary'} as PDF!`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF. Trying text download...')
      
      // Fallback to text download
      const summaryType = summaryTypes.find(t => t.id === type)
      const filename = `ai-summary-${summaryType?.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
      const blob = new Blob([summary], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleRefreshSummary = async (type: string) => {
    // Reset the timestamp to allow regeneration
    const newLastGenerated = { ...lastGenerated }
    delete newLastGenerated[type]
    setLastGenerated(newLastGenerated)
    localStorage.setItem('ai-summarizer-last-generated', JSON.stringify(newLastGenerated))
    toast.success('You can now generate a new summary!')
  }

  return (
    <div className="flex-1 bg-background p-3 sm:p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Summarizer</h1>
              <p className="text-muted-foreground">Get intelligent insights about your trading performance</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Summaries Generated</div>
              <div className="text-2xl font-bold text-foreground">
                {Object.keys(generatedSummaries).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Avg Summary Time</div>
              <div className="text-2xl font-bold text-foreground">2.5s</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Response Quality</div>
              <div className="text-2xl font-bold text-green-500">High</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">AI Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-2xl font-bold text-foreground">Ready</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Data Visualization */}
        {loadingData && (
          <div className="mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-[200px]">
                  <Skeleton className="w-full h-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {!loadingData && tradesData.length === 0 && (
          <div className="mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Trading Data Yet</h3>
                  <p className="text-muted-foreground">Start tracking your trades to see AI-generated insights and analytics!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {!loadingData && tradesData.length > 0 && (
          <Charts tradesData={tradesData} statsData={statsData} />
        )}

        {/* Summary Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryTypes.map((type) => {
            const Icon = type.icon
            const isLoading = loading && selectedType === type.id
            const isDisabled = loading && selectedType !== type.id
            const isLocked = !canGenerate(type.id)
            const timeUntil = getTimeUntilNext(type.id)

            return (
              <Card 
                key={type.id} 
                className={`bg-card border-border transition-all duration-300 ${
                  isLocked ? 'opacity-60' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoading && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      )}
                      {isLocked && !isLoading && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                      {!isLocked && !isLoading && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{type.title}</CardTitle>
                  <CardDescription>
                    {isLocked && timeUntil ? (
                      <span className="text-orange-600">
                        Available in {timeUntil.hours}h {timeUntil.minutes}m
                      </span>
                    ) : (
                      type.description
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full ${
                      isLocked 
                        ? 'bg-gray-500 text-white hover:bg-gray-600 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    onClick={() => handleGenerateSummary(type.id)}
                    disabled={isDisabled || isLocked}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Rate Limited (24hr)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Generated Summaries Display */}
        {Object.keys(generatedSummaries).length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Generated Summaries
            </h2>
            <div className="space-y-4">
              {Object.entries(generatedSummaries).map(([type, summary]) => {
                const summaryType = summaryTypes.find(t => t.id === type)
                const Icon = summaryType?.icon || FileText
                const color = summaryType?.color || 'bg-gray-500'
                
                return (
                  <Card key={type} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <CardTitle className="text-foreground">{summaryType?.title || 'Summary'}</CardTitle>
                            <CardDescription>
                              Generated on {new Date(lastGenerated[type] || Date.now()).toLocaleString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopySummary(summary, type)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadSummary(summary, type)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefreshSummary(type)}
                            className="h-8 w-8 p-0"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                          <div className="text-sm text-foreground">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-foreground">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-foreground">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-foreground">{children}</h3>,
                              p: ({ children }) => <p className="mb-2 text-foreground">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-foreground">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-foreground">{children}</ol>,
                              li: ({ children }) => <li className="mb-1 text-foreground">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                              em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                              code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">{children}</blockquote>,
                              hr: () => <hr className="my-4 border-border" />,
                              table: ({ children }) => <table className="w-full border-collapse border border-border mb-2">{children}</table>,
                              th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted font-semibold text-left text-foreground">{children}</th>,
                              td: ({ children }) => <td className="border border-border px-2 py-1 text-foreground">{children}</td>,
                            }}
                          >
                              {summary}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Coming Soon Section */}
        <Card className="mt-6 bg-muted/50 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Integration</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              This feature is coming soon! The AI Summarizer will use advanced AI models to provide intelligent 
              insights and analysis of your trading performance. Future enhancements will include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Real-time AI-powered summary generation</li>
              <li>Pattern recognition and performance analysis</li>
              <li>Personalized trading recommendations</li>
              <li>Market sentiment analysis</li>
              <li>Risk assessment and suggestions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

