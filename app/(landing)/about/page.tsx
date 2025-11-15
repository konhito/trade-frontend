import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, LineChart, GraduationCap, TrendingUp, Shield, BarChart3, Brain, FileText } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about MyTradeJournal - built by traders, for traders. Founded by Anubhav Singh, a finance professional with extensive trading experience and NISM certifications.',
  keywords: [
    'about MyTradeJournal',
    'trading journal founder',
    'trading software company',
    'finance professional',
    'trading analytics platform',
    'trade journal creator'
  ],
  openGraph: {
    title: 'About Us | MyTradeJournal',
    description: 'Learn about MyTradeJournal - built by traders, for traders. Founded by Anubhav Singh, a finance professional with extensive trading experience.',
    url: 'https://www.mytradejournal.co.in/about',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in/about',
  },
}

export default function AboutPage() {
  const founderSkills = [
    { name: "Capital & Financial Markets", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Retail Banking Operations", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Derivatives & Risk Management", icon: <Shield className="w-4 h-4" /> },
    { name: "Options Strategies (Straddle, Strangle, Hedging)", icon: <TrendingUp className="w-4 h-4" /> },
    { name: "Price Action & Volatility Analysis", icon: <LineChart className="w-4 h-4" /> },
    { name: "Trading Psychology & Behavioral Finance", icon: <Brain className="w-4 h-4" /> },
    { name: "Strategy Backtesting & Trade Journaling", icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <div className="px-4 py-12 bg-background text-foreground">
      <h1 className="text-4xl font-bold text-center mb-8">About MyTradeJournal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At MyTradeJournal, we&apos;re on a mission to empower traders with advanced analytics and AI-driven insights. 
              Our platform is designed to help you understand your trading patterns, optimize your strategies, 
              and ultimately become a better trader through comprehensive backtesting and analysis of your real track record.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">The Founder&apos;s Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Anubhav Singh, the founder of MyTradeJournal, is a finance professional and passionate trader with over 3–5 years of real market experience. He has completed his MBA in Finance and holds multiple NISM certifications in Equity, Derivatives, and Risk Management, as well as a certification from the NSE Academy in capital markets.
            </p>
            <p className="text-muted-foreground">
              He began his career with HDFC Bank in the Retail Branch Banking division, where he gained hands-on knowledge of financial products, client management, and investment advisory. Later, he worked with Kedia Capital, a leading stock broking firm, where he deepened his understanding of the capital market structure, derivatives trading, and client portfolio management.
            </p>
            <p className="text-muted-foreground">
              Alongside his professional journey, Anubhav has been a dedicated market participant and strategy-based trader. Over the years, he has tested, refined, and mastered multiple strategies including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Straddle Strategy</strong> – Managing at-the-money (ATM) straddles with dynamic hedging and controlled risk.</li>
              <li><strong>Strangle Strategy</strong> – Positioning trades based on volatility and option premium behavior.</li>
              <li><strong>Price Action Analysis</strong> – Identifying intraday trends, key breakout levels, and volume zones to enhance accuracy.</li>
            </ul>
            <p className="text-muted-foreground">
              His unique combination of banking experience, technical trading skills, and risk management expertise led him to create MyTradeJournal.co.in — a platform designed to help traders track, analyze, and improve their trading performance using data-driven insights and structured journaling.
            </p>
            <p className="text-muted-foreground">
              Anubhav believes that consistent profitability comes not just from good entries but from disciplined journaling, emotional control, and continuous analysis — values that form the foundation of MyTradeJournal.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Founder&apos;s Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {founderSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-1 px-2 flex items-center gap-1">
                  {skill.icon}
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Why MyTradeJournal?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Built by a trader, for traders</li>
              <li>Advanced analytics powered by real-world trading experience</li>
              <li>Comprehensive backtesting using your actual trade history</li>
              <li>AI-driven insights to improve your trading psychology</li>
              <li>Tailored to serious traders looking to elevate their performance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}