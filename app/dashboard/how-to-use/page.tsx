'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayCircle, BookOpen, Lightbulb } from "lucide-react"

export default function HowToUsePage() {
  // Extract video IDs from YouTube URLs
  const englishVideoId = "yPrgWlVaLqg"
  const hindiVideoId = "8x_BsbUk3kI"

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">How to Use MyTradeJournal</h1>
            <p className="text-muted-foreground mt-1">
              Learn how to get the most out of your trading journal platform
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Video Tutorials Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              <CardTitle>Video Tutorials</CardTitle>
            </div>
            <CardDescription>
              Watch our step-by-step video guides to learn how to use all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="hindi">हिंदी (Hindi)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="english" className="mt-6">
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${englishVideoId}`}
                      title="How to Use MyTradeJournal - English Tutorial"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Complete guide to using MyTradeJournal in English
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="hindi" className="mt-6">
                <div className="space-y-4">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${hindiVideoId}`}
                      title="MyTradeJournal का उपयोग कैसे करें - हिंदी ट्यूटोरियल"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    MyTradeJournal का उपयोग करने के लिए पूर्ण गाइड (हिंदी में)
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle>Quick Start Guide</CardTitle>
            </div>
            <CardDescription>
              Get started with the essential features in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Add Your First Trade</h3>
                    <p className="text-sm text-muted-foreground">
                      Navigate to the Trades page and click "Add Trade" to start recording your trading activity. 
                      You can manually enter trades or import them from supported brokers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">View Your Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      The Dashboard provides an overview of your trading performance with key metrics, 
                      charts, and statistics to help you understand your trading patterns.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Use AI Summarizer</h3>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered insights about your trading performance. The AI Summarizer analyzes 
                      your trades and provides actionable recommendations to improve your strategy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Track Your Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the Calendar view to see your trading activity over time. This helps you 
                      identify patterns and maintain consistent trading habits.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Analyze Strategies</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and track different trading strategies. Compare their performance and 
                      identify which approaches work best for your trading style.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              Explore the powerful features that help you become a better trader
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Trade Management</h4>
                <p className="text-sm text-muted-foreground">
                  Record, edit, and organize all your trades in one place with advanced filtering and search capabilities.
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Performance Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive analytics and charts to visualize your trading performance, win rate, and profitability.
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">AI-Powered Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Get intelligent analysis and recommendations powered by advanced AI to improve your trading decisions.
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Multi-Broker Support</h4>
                <p className="text-sm text-muted-foreground">
                  Import trades from multiple brokers including Tradovate, ATAS, and more with automated synchronization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

