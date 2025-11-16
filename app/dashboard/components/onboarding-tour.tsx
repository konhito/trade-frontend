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
import { BookOpen, ArrowRight } from "lucide-react"

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
    description: "Let's get you started! Check out our How to Use guide with video tutorials to learn how to use the platform.",
    action: {
      label: "View How to Use Guide",
      path: "/dashboard/how-to-use"
    }
  }
]

export function OnboardingTour() {
  const router = useRouter()
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
    // Navigate to How to Use page
    router.push("/dashboard/how-to-use")
    
    // Tour completed
    handleComplete()
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

  const currentStepData = tourSteps[0]

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
            {currentStepData.action?.label || 'Get Started'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

