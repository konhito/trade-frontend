'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignUpForm } from '../authentication/components/sign-up-form'
import { useAuth } from '@/context/auth-provider'
import { Loader2, Quote } from 'lucide-react'
import { Logo } from '@/components/logo'

// Trading quotes for the overlay
const tradingQuotes = [
  {
    quote: "The goal of a successful trader is to make the best trades. Money is secondary.",
    author: "Alexander Elder"
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett"
  },
  {
    quote: "The market can remain irrational longer than you can remain solvent.",
    author: "John Maynard Keynes"
  },
  {
    quote: "In trading, consistency beats perfection every time.",
    author: "Professional Trader"
  },
  {
    quote: "The best traders have no ego. You have to swallow your pride and get out of a losing position.",
    author: "Paul Tudor Jones"
  },
  {
    quote: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.",
    author: "George Soros"
  },
  {
    quote: "The most important thing in trading is to preserve capital. Profits will follow.",
    author: "Trading Wisdom"
  },
  {
    quote: "Plan your trade and trade your plan. Discipline is the bridge between goals and accomplishment.",
    author: "Trading Mantra"
  }
]

function SignUpContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  useEffect(() => {
    // If already authenticated, redirect to dashboard or next URL
    if (!isLoading && isAuthenticated) {
      let nextUrl = searchParams.get('next') || '/dashboard'
      // Decode the next URL if it exists and is not the default
      if (nextUrl && nextUrl !== '/dashboard') {
        try {
          nextUrl = decodeURIComponent(nextUrl)
          // Ensure it's a valid path starting with /
          if (!nextUrl.startsWith('/')) {
            nextUrl = '/dashboard'
          }
        } catch {
          // If decoding fails, default to dashboard
          nextUrl = '/dashboard'
        }
      }
      // Use router.replace for client-side navigation (faster, no full reload)
      router.replace(nextUrl)
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Rotate trading quotes every 5 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % tradingQuotes.length)
    }, 5000)

    return () => clearInterval(quoteInterval)
  }, [])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center p-4 md:grid md:h-screen md:p-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src="/auth-background.jpeg"
            alt="Authentication background"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90" />
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        
        <div className="relative z-20 flex items-center gap-0.5 font-medium">
          <Logo width={100} height={100} />
          <span className="text-white text-2xl font-bold pt-4">MyTradeJournal</span>
        </div>
        
        {/* Trading Quotes Overlay */}
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="max-w-lg px-4">
            <div className="mb-6 flex items-center justify-center">
              <Quote className="h-8 w-8 text-white/60" />
            </div>
            <div 
              key={currentQuoteIndex}
              className="quote-slide"
            >
              <blockquote className="space-y-4">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-white drop-shadow-lg">
                  &ldquo;{tradingQuotes[currentQuoteIndex].quote}&rdquo;
                </p>
                <footer className="text-sm md:text-base text-white/70 italic">
                  — {tradingQuotes[currentQuoteIndex].author}
                </footer>
              </blockquote>
            </div>
            
            <style>{`
              .quote-slide {
                animation: fadeInUp 0.6s ease-in-out;
              }
              
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            {/* Quote indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {tradingQuotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuoteIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentQuoteIndex
                      ? 'bg-white w-8'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full p-4 md:p-8 lg:p-8">
        <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center px-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Create an account
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Enter your email and password to create your account
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="container relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}

