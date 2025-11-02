'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Settings } from "lucide-react"

export default function ToolsPage() {

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trading Tools</h1>
            <p className="text-muted-foreground">Access powerful tools to enhance your trading performance</p>
          </div>
          <Badge className="bg-yellow-500 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100 text-lg px-4 py-2">
            Coming Soon
          </Badge>
        </div>

        {/* Coming Soon Message */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="bg-card border-border p-12 max-w-md">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Wrench className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
              <p className="text-muted-foreground">
                We're building a suite of powerful trading tools including calculators, analysis tools, and utilities to enhance your trading performance. 
                Stay tuned for position sizing calculators, risk-reward analyzers, and more.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="w-4 h-4 animate-spin" />
                <span>Stay tuned for updates!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}