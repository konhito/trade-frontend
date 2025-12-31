'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Database, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  ArrowLeft,
  Grid3x3,
  PieChart
} from 'lucide-react'

export default function GoogleSheetJournalPage() {
  const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1HOe_Rzu91IKjBKJIMy983qw2BkH1rh0vK-bmsnAh85w/edit?usp=sharing'

  const sheetFeatures = [
    {
      id: 'daily-pnl',
      title: 'Clients Daily PNL',
      icon: <Calendar className="h-6 w-6" />,
      description: 'Track daily profit and loss for all your clients with comprehensive metrics',
      features: [
        'Daily PNL tracking by date',
        'Cumulative P&L calculation',
        'Drawdown (DD) calculation',
        'Multi-client support with separate columns',
        'Color-coded profit/loss indicators',
        'Month and day filtering',
        'Total summary across all clients'
      ],
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'overall-dashboard',
      title: 'Overall Dashboard',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'Comprehensive overview with heatmap visualization and performance metrics',
      features: [
        'Win/Loss ratio tracking',
        'Average profit on winning days',
        'Average loss on losing days',
        'Maximum profit and loss records',
        'Monthly calendar heatmap view',
        'Returns by day of week analysis',
        'Total PNL summary with date range',
        'Visual color-coded performance indicators'
      ],
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      borderColor: 'border-green-500/20'
    },
  ]

  const keyBenefits = [
    {
      title: 'Multi-Client Management',
      description: 'Track multiple clients or trading strategies in one unified system',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Real-time Analytics',
      description: 'Get instant insights into your trading performance with automated calculations',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: 'Visual Heatmaps',
      description: 'See your trading patterns at a glance with color-coded calendar views',
      icon: <Grid3x3 className="h-5 w-5" />
    },
    {
      title: 'Comprehensive Metrics',
      description: 'Track win ratios, drawdowns, average profits, and more',
      icon: <PieChart className="h-5 w-5" />
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <Link href="/#features">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Features
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">My trade journal 2026</h1>
              <p className="text-xl text-muted-foreground">
                A comprehensive Google Sheets solution for tracking and analyzing trading performance
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <a href={googleSheetUrl} target="_blank" rel="noopener noreferrer">
                Open Google Sheet
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Overview Section */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Complete Trading Journal Solution</h2>
            <p className="text-lg text-muted-foreground">
              This comprehensive Google Sheets template provides everything you need to track, analyze, and improve your trading performance. 
              Whether you're managing your own trades or tracking multiple clients, this comprehensive system offers powerful analytics 
              and visualizations to help you make data-driven decisions.
            </p>
          </div>

          {/* Key Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {keyBenefits.map((benefit, index) => (
              <Card key={index} className="bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Sheet Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Sheet Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sheetFeatures.map((sheet) => (
              <Card 
                key={sheet.id} 
                className={`bg-card border-2 ${sheet.borderColor} hover:shadow-lg transition-shadow`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${sheet.color}`}>
                        {sheet.icon}
                      </div>
                      <CardTitle className="text-2xl">{sheet.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {sheet.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {sheet.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Access the full Google Sheets template and start tracking your trading performance today. 
            The template is fully customizable and ready to use.
          </p>
          <p className="text-base font-semibold mb-6 max-w-2xl mx-auto text-foreground">
            Sign up to complete your setup and unlock the full power of MyTradeJournal!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/signup">
                Sign Up to Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href={googleSheetUrl} target="_blank" rel="noopener noreferrer">
                Open Google Sheet Template
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Additional Info */}
        <section className="mt-16 max-w-3xl mx-auto">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Make a Copy</h3>
                <p className="text-muted-foreground">
                  Click the "Open Google Sheet" button above and make a copy of the template to your Google Drive.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Customize for Your Needs</h3>
                <p className="text-muted-foreground">
                  Add your client names, update capital amounts, and customize the sheets according to your trading setup.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Start Tracking</h3>
                <p className="text-muted-foreground">
                  Begin entering your daily PNL data in the "Clients Daily PNL" sheet. The dashboard will automatically 
                  calculate and visualize your performance metrics.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Analyze Performance</h3>
                <p className="text-muted-foreground">
                  Use the Overall Dashboard and Client Dashboard to analyze your trading patterns, identify strengths 
                  and weaknesses, and make data-driven improvements.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

