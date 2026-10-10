'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignInForm } from '../authentication/components/sign-in-form'
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
    quote: "Markets can remain irrational a lot longer than you and I can remain solvent.",
    author: "A. Gary Shilling"
  },
  {
    quote: "I'm always thinking about losing money as opposed to making money. Don't focus on making money, focus on protecting what you have.",
    author: "Paul Tudor Jones"
  },
  {
    quote: "The best traders have no ego. You have to swallow your pride and get out of the losses.",
    author: "Tom Baldwin"
  },
  {
    quote: "It's not whether you're right or wrong, but how much money you make when you're right and how much you lose when you're wrong.",
    author: "Stanley Druckenmiller"
  },
  {
    quote: "Win or lose, everybody gets what they want out of the market.",
    author: "Ed Seykota"
  },
  {
    quote: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn"
  }
]

function SignInContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const getRedirectUrl = () => {
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
    return nextUrl
  }

  // Handle OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && typeof window !== 'undefined') {
      // Store token from OAuth callback
      localStorage.setItem('token', token)
      // Dispatch event to notify auth system
      window.dispatchEvent(new Event('auth-token-stored'))
      // Remove token from URL
      const newUrl = window.location.pathname + (searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : '')
      window.history.replaceState({}, '', newUrl)
      // Redirect will happen via auth-token-stored event
      return
    }
  }, [searchParams])

  useEffect(() => {
    // If already authenticated, redirect to dashboard or next URL
    // Only redirect if we're actually authenticated (not just loading state)
    if (!isLoading && isAuthenticated && !hasRedirected.current) {
      // Check if we actually have a valid token before redirecting
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        hasRedirected.current = true
        const redirectUrl = getRedirectUrl()
        // Use router.push instead of window.location to avoid full page reload loops
        router.replace(redirectUrl)
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Also listen for auth token stored event (fired immediately after login)
  useEffect(() => {
    const handleAuthTokenStored = () => {
      if (!hasRedirected.current) {
        // Verify token actually exists before redirecting
        const token = localStorage.getItem('token')
        if (token) {
          hasRedirected.current = true
          // Small delay to ensure auth state is fully updated
          setTimeout(() => {
            const redirectUrl = getRedirectUrl()
            router.replace(redirectUrl)
          }, 300)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-stored', handleAuthTokenStored)
      return () => window.removeEventListener('auth-token-stored', handleAuthTokenStored)
    }
  }, [router, searchParams])

  // Pick one quote per local calendar day, then update at the next midnight.
  useEffect(() => {
    let quoteTimeout: ReturnType<typeof setTimeout>
    const updateDailyQuote = () => {
      const now = new Date()
      const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000)
      setCurrentQuoteIndex(dayNumber % tradingQuotes.length)

      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      quoteTimeout = setTimeout(updateDailyQuote, nextMidnight.getTime() - now.getTime())
    }

    updateDailyQuote()
    return () => clearTimeout(quoteTimeout)
  }, [])

  // Show loading state while checking authentication (but don't show loading if we have a token)
  // This prevents showing loading screen after successful login
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  if (isLoading && !hasToken) {
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
          <Logo width={100} height={100} className="pt-2" />
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
            
          </div>
        </div>
      </div>
      <div className="w-full p-4 md:p-8 lg:p-8">
        <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center px-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Sign in to your account
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Enter your email and password to sign in
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="container relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

