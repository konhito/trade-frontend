'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignUpForm } from '../authentication/components/sign-up-form'
import { useAuth } from '@/context/auth-provider'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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
            className="h-full w-full object-cover opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-zinc-900/60" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          MyTradeJournal
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Elevate your trading performance with comprehensive analytics and intelligent insights.&rdquo;
            </p>
            <footer className="text-sm">Trading Journal Platform</footer>
          </blockquote>
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

