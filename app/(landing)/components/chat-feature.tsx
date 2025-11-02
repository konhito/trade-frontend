"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { User, Bot, Target, AlertTriangle, CheckCircle } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  showAnalysis?: boolean
  analysis?: {
    metric: string
    value: string
    trend: "positive" | "negative" | "neutral"
    insight: string
  }
}

interface TradingChatAssistantProps {
  className?: string
  maxMessages?: number
}

export default function TradingChatAssistant({ className = "", maxMessages = 3 }: TradingChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoopRunning, setIsLoopRunning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const CONVERSATION_LOOP = [
    {
      user: "Analyze my trading performance",
      assistant: "Based on your recent trades, I can see you have a 68% win rate with strong consistency in trend-following setups.",
      analysis: {
        metric: "Win Rate",
        value: "68%",
        trend: "positive" as const,
        insight: "Your win rate is above average, indicating good trade selection.",
      },
    },
    {
      user: "What patterns should I focus on?",
      assistant: "I notice you tend to take revenge trades after losses. This pattern appears in 23% of your losing sessions.",
      analysis: {
        metric: "Revenge Trading",
        value: "23%",
        trend: "negative" as const,
        insight: "Consider implementing a cooling-off period after losses to reduce emotional trading.",
      },
    },
    {
      user: "How's my risk management?",
      assistant: "Your risk-reward ratio averages 1:2.5, which is excellent. You're maintaining discipline in position sizing.",
      analysis: {
        metric: "Risk-Reward Ratio",
        value: "1:2.5",
        trend: "positive" as const,
        insight: "Strong risk management is contributing to your profitability.",
      },
    },
    {
      user: "What's my most profitable setup?",
      assistant: "Breakout trades during high volatility periods show your highest success rate at 78%.",
      analysis: {
        metric: "Best Setup",
        value: "78%",
        trend: "positive" as const,
        insight: "Focus on expanding this setup type while maintaining your current risk parameters.",
      },
    },
    {
      user: "When should I trade?",
      assistant: "Your execution quality drops by 15% during overlapping sessions. Consider focusing on single market sessions.",
      analysis: {
        metric: "Execution Quality",
        value: "-15%",
        trend: "negative" as const,
        insight: "Trading during multiple market sessions may be reducing your focus and execution quality.",
      },
    },
    {
      user: "Any insights from my journal?",
      assistant: "I've detected stress indicators before 40% of your losing trades. Emotional state tracking could help.",
      analysis: {
        metric: "Emotional State",
        value: "40%",
        trend: "negative" as const,
        insight: "Consider journaling your emotional state before trades to identify patterns.",
      },
    },
    {
      user: "Should I adjust my position sizing?",
      assistant: "Your position sizing consistency has improved by 22% this month. Keep this discipline.",
      analysis: {
        metric: "Position Sizing",
        value: "+22%",
        trend: "positive" as const,
        insight: "Maintaining consistent position sizes is helping your overall performance.",
      },
    },
  ]

  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => {
        // Keep only the most recent messages up to maxMessages
        const newMessages = [...prev, message]
        if (newMessages.length > maxMessages) {
          return newMessages.slice(newMessages.length - maxMessages)
        }
        return newMessages
      })
    },
    [maxMessages],
  )

  const simulateStreaming = useCallback(
    async (text: string, analysis?: any) => {
      const messageId = Date.now().toString()

      // Add initial streaming message
      addMessage({
        id: messageId,
        role: "assistant",
        content: "",
        isStreaming: true,
        showAnalysis: false,
        analysis,
      })

      await new Promise((resolve) => setTimeout(resolve, 300))

      // Stream text character by character
      const chars = text.split("")
      for (let i = 0; i < chars.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 25 + Math.random() * 15))
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.id === messageId ? { ...msg, content: chars.slice(0, i + 1).join("") } : msg,
          )
          return updatedMessages
        })
      }

      // Complete streaming
      await new Promise((resolve) => setTimeout(resolve, 200))
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)))

      // Show analysis with delay if it exists
      if (analysis) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, showAnalysis: true } : msg)))
      }
    },
    [addMessage],
  )

  const fadeOutAllMessages = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    setMessages([])
  }, [])

  const runConversationLoop = useCallback(async () => {
    if (isLoopRunning) return

    setIsLoopRunning(true)

    // Reset if we've completed all conversations
    if (currentIndex >= CONVERSATION_LOOP.length) {
      await fadeOutAllMessages()
      setCurrentIndex(0)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoopRunning(false)
      return
    }

    const current = CONVERSATION_LOOP[currentIndex]

    // Add user message
    addMessage({
      id: `user-${currentIndex}-${Date.now()}`,
      role: "user",
      content: current.user,
    })

    await new Promise((resolve) => setTimeout(resolve, 1800))

    // Stream assistant response
    await simulateStreaming(current.assistant, current.analysis)

    await new Promise((resolve) => setTimeout(resolve, 3000))
    setCurrentIndex((prev) => prev + 1)
    setIsLoopRunning(false)
  }, [currentIndex, isLoopRunning, addMessage, simulateStreaming, fadeOutAllMessages])

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Start the loop
    timeoutRef.current = setTimeout(() => {
      runConversationLoop()
    }, 1000)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentIndex, isLoopRunning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "positive":
        return <CheckCircle className="h-3 w-3 text-black dark:text-white" />
      case "negative":
        return <AlertTriangle className="h-3 w-3 text-black dark:text-white" />
      default:
        return <Target className="h-3 w-3 text-gray-600 dark:text-gray-400" />
    }
  }

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "positive":
        return "Positive"
      case "negative":
        return "Negative"
      default:
        return "Neutral"
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-0 bg-white dark:bg-black transition-colors duration-500 ${className}`}
      style={{
        contain: "layout style paint",
        isolation: "isolate",
      }}
    >
      <div className="w-full h-full border border-muted bg-white dark:bg-black shadow-lg dark:shadow-gray-900/50 transition-all duration-500 rounded-lg overflow-hidden">
        <div className="p-4 h-full flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-muted transition-colors duration-300 flex-shrink-0">
            <Bot className="h-4 w-4 text-black dark:text-white transition-colors duration-300" />
            <span className="text-sm font-medium text-black dark:text-white transition-colors duration-300">
              Trading Assistant
            </span>
            <div className="ml-auto text-xs text-muted-foreground">
              AI Powered
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col justify-end space-y-3 text-xs">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 opacity-0 animate-slide-in ${message.role === "user" ? "justify-end" : ""}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        message.role === "user" ? "bg-black dark:bg-white" : "bg-muted"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-3 w-3 text-white dark:text-black transition-colors duration-300" />
                      ) : (
                        <Bot className="h-3 w-3 text-black dark:text-white transition-colors duration-300" />
                      )}
                    </div>

                    <div
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        message.role === "user"
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-muted text-black dark:text-white border border-muted"
                      }`}
                    >
                      <p className="leading-relaxed">
                        {message.content}
                        {message.isStreaming && (
                          <span className="animate-pulse text-gray-500 dark:text-gray-400 ml-1">|</span>
                        )}
                      </p>

                      {message.analysis && message.role === "assistant" && (
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-out ${
                            message.showAnalysis ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
                          }`}
                        >
                          <div className="pt-2 border-t border-muted-foreground transition-colors duration-300">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-black dark:text-white text-xs">
                                {message.analysis.metric}
                              </span>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(message.analysis.trend)}
                                <span className="text-xs font-mono text-black dark:text-white">
                                  {getTrendLabel(message.analysis.trend)}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-black dark:text-white mb-1">
                              {message.analysis.value}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{message.analysis.insight}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
