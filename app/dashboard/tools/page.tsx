'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, LineChart, Calculator, Brain, Sparkles } from "lucide-react"

export default function ToolsPage() {
  const comingSoonTools = [
    {
      title: "Calculators for quick trade and P&L analysis",
      description: "Fast and accurate calculators to analyze your trades and calculate profit & loss instantly.",
      icon: BarChart3,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Analysis tools to study market behavior",
      description: "Advanced analysis tools to understand market patterns, trends, and behavior.",
      icon: LineChart,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Position sizing & risk management calculators",
      description: "Calculate optimal position sizes and manage risk effectively with our risk management tools.",
      icon: Calculator,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Strategy studies and community insights",
      description: "Study trading strategies and get insights from the community to improve your approach.",
      icon: Brain,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ]

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Trading Tools</h1>
            <Badge className="bg-yellow-500 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100">
              Coming Soon
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Everything will be available straight on the platform, so you can plan, analyze, and execute smarter.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">These tools will include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonTools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <Card key={index} className="relative overflow-hidden border-2 border-dashed">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`${tool.bgColor} p-3 rounded-lg flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom Message */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-center justify-center">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <p className="text-muted-foreground">
                We're working hard to bring you these powerful tools. Stay tuned for updates!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}