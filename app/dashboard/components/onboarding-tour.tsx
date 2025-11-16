'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ArrowRight, CheckCircle2, X } from "lucide-react"

interface TourStep {
  title: string
  description: string
  action?: {
    label: string
    path: string
  }
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to MyTradeJournal! 🎉",
    description: "Let's take a quick tour to help you get started. First, let's check out our How to Use guide with video tutorials.",
    action: {
      label: "View How to Use Guide",
      path: "/dashboard/how-to-use"
    }
  },
  {
    title: "Add Your First Trade",
    description: "Start by adding your trades. Go to the Trades page to manually enter trades or import them from your broker.",
    action: {
      label: "Go to Trades",
      path: "/dashboard/trades"
    }
  },
  {
    title: "Explore Your Dashboard",
    description: "Your dashboard shows key metrics, charts, and statistics about your trading performance. Check it out!",
    action: {
      label: "View Dashboard",
      path: "/dashboard"
    }
  },
  {
    title: "Try AI Summarizer",
    description: "Get AI-powered insights about your trading. The AI Summarizer analyzes your trades and provides recommendations.",
    action: {
      label: "Try AI Summarizer",
      path: "/dashboard/ai-summarizer"
    }
  },
  {
    title: "You're All Set! 🚀",
    description: "You've completed the tour! Start tracking your trades and improving your performance. You can always access the How to Use guide from the sidebar.",
  }
]

export function OnboardingTour() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [hasCompletedTour, setHasCompletedTour] = useState(false)

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem('mytradejournal_tour_completed')
    if (tourCompleted === 'true') {
      setHasCompletedTour(true)
      return
    }

    // Check if this is the first visit
    const firstVisit = localStorage.getItem('mytradejournal_first_visit')
    if (!firstVisit) {
      // Mark as visited and show tour after a short delay
      localStorage.setItem('mytradejournal_first_visit', 'true')
      setTimeout(() => {
        setIsOpen(true)
      }, 1000) // Show tour after 1 second
    }
  }, [])

  const handleNext = () => {
    const step = tourSteps[currentStep]
    
    // If step has an action, navigate to that path
    if (step.action) {
      router.push(step.action.path)
    }

    // Move to next step
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Tour completed
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('mytradejournal_tour_completed', 'true')
    setIsOpen(false)
    setHasCompletedTour(true)
  }

  if (hasCompletedTour || !isOpen) {
    return null
  }

  const currentStepData = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleSkip()
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Skip Tour
          </Button>
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto"
          >
            {currentStep === tourSteps.length - 1 ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Get Started
              </>
            ) : (
              <>
                {currentStepData.action?.label || 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

