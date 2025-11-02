import { BarChart3, Calendar, Database, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ImportFeature } from "./import-feature"
import TradingChatAssistant from "./chat-feature"

export default function Features() {
  const features = [
    {
      id: "ai-journaling",
      title: "AI Trading Journal",
      icon: <Brain className="h-5 w-5 text-muted-foreground" />,
      description: "Get AI-powered insights and analysis of your trading performance",
      stat: "AI Powered",
      image: <TradingChatAssistant />
    },
    {
      id: "performance-visualization",
      title: "Performance Visualization",
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
      description: "Track and visualize your trading performance with comprehensive charts",
      stat: "Real-time Analytics",
      image: {
        light: "/charts-light.png",
        dark: "/charts-dark.png"
      }
    },
    {
      id: "daily-performance",
      title: "Daily Performance",
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
      description: "Monitor your daily trading results and progress",
      stat: "Daily Tracking",
      image: {
        light: "/calendar-light.png",
        dark: "/calendar-dark.png"
      }
    },
    {
      id: "data-import",
      title: "Data Import",
      icon: <Database className="h-5 w-5 text-muted-foreground" />,
      description: "Easily import your trading data from various sources",
      stat: "Multiple Formats",
      image: <ImportFeature />
    }
  ]

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Powerful Trading Features</h1>
      <p className="text-xl text-center text-gray-600 mb-12">Everything you need to track and improve your trading performance</p>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {features.map((feature, index) => (
          <Card 
            id={feature.id} 
            key={feature.id} 
            className={`bg-card ${
              index < 2 ? 'lg:col-span-3' : 
              index === 2 ? 'lg:col-span-4' : 'lg:col-span-2'
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                {feature.id === 'ai-journaling' && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 border-purple-500/20">
                    Coming Soon
                  </Badge>
                )}
              </div>
              {feature.icon}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div>
                  <div className="text-2xl font-bold">{feature.stat}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {feature.description}
                  </p>
                </div>
                <div className="relative h-[300px] w-full flex justify-center items-center">
                  {typeof feature.image === 'object' && 'light' in feature.image ? (
                    <>
                      <Image
                        src={feature.image.light}
                        alt={`${feature.title} visualization`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md dark:hidden"
                      />
                      <Image
                        src={feature.image.dark}
                        alt={`${feature.title} visualization`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md hidden dark:block"
                      />
                    </>
                  ) : (
                    feature.image
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}