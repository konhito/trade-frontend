'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useTheme } from '@/context/theme-provider'
import { useAuth } from '@/context/auth-provider'
import Features from './components/features'
import Partners from './components/partners'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardPrefetch } from '@/hooks/use-prefetch'
import { Loader2 } from 'lucide-react'


export default function LandingPage() {
    const { theme, effectiveTheme } = useTheme();
    const router = useRouter()
    const searchParams = useSearchParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasProcessedToken = useRef(false);
    const redirectUrlRef = useRef<string | null>(null);
    
    // Prefetch dashboard data if user is authenticated
    useDashboardPrefetch();
    
    // Handle OAuth callback token from URL - RUN THIS FIRST
    useEffect(() => {
        if (hasProcessedToken.current) return;
        
        // Check URL params directly (more reliable than searchParams)
        // Use window.location.search directly as it's the most reliable
        const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
        const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
        const urlParams = currentSearch ? new URLSearchParams(currentSearch) : null
        
        // Try multiple methods to get the token
        const tokenFromSearchParams = searchParams.get('token')
        const tokenFromUrlParams = urlParams?.get('token')
        const tokenFromUrl = currentSearch.includes('token=') 
            ? currentSearch.split('token=')[1]?.split('&')[0] 
            : null
        
        // Decode token if found in URL string
        let token = tokenFromSearchParams || tokenFromUrlParams || tokenFromUrl
        if (token && token.includes('%')) {
            try {
                token = decodeURIComponent(token)
            } catch (e) {
                console.warn('[LandingPage] Token decode failed, using as-is')
            }
        }
        
        console.log('[LandingPage] Checking for token in URL:', token ? 'FOUND' : 'NOT FOUND')
        console.log('[LandingPage] Full URL:', currentUrl)
        console.log('[LandingPage] URL search:', currentSearch)
        console.log('[LandingPage] searchParams.get("token"):', tokenFromSearchParams)
        console.log('[LandingPage] urlParams.get("token"):', tokenFromUrlParams)
        console.log('[LandingPage] tokenFromUrl:', tokenFromUrl)
        console.log('[LandingPage] Final token:', token ? `${token.substring(0, 30)}...` : null)
        
        if (token && typeof window !== 'undefined') {
            console.log('[LandingPage] ✅ Processing OAuth token from URL...')
            hasProcessedToken.current = true;
            
            // Decode token if it's URL encoded
            let decodedToken = token
            try {
                decodedToken = decodeURIComponent(token)
            } catch (e) {
                console.warn('[LandingPage] Token decode failed, using as-is')
            }
            
            // Store token from OAuth callback IMMEDIATELY
            localStorage.setItem('token', decodedToken)
            // Mark this as a fresh OAuth token so validation doesn't clear it too early
            localStorage.setItem('oauth_token_fresh', 'true')
            // Store timestamp for debugging
            localStorage.setItem('oauth_token_timestamp', Date.now().toString())
            // Remove the flag after 10 seconds (enough time for validation)
            setTimeout(() => {
                localStorage.removeItem('oauth_token_fresh')
                localStorage.removeItem('oauth_token_timestamp')
            }, 10000)
            
            console.log('[LandingPage] ✅ Token stored in localStorage, length:', decodedToken.length)
            console.log('[LandingPage] ✅ Token preview:', decodedToken.substring(0, 30) + '...')
            console.log('[LandingPage] ✅ Verifying storage - token in localStorage:', !!localStorage.getItem('token'))
            
            // Get redirect URL
            const next = searchParams.get('next') || '/dashboard'
            let nextUrl = '/dashboard'
            if (next) {
                try {
                    const decoded = decodeURIComponent(next)
                    if (decoded.startsWith('/')) {
                        nextUrl = decoded
                    }
                } catch {
                    // Invalid encoding, use default
                }
            }
            
            redirectUrlRef.current = nextUrl
            console.log('[LandingPage] Will redirect to:', nextUrl)
            
            // Remove token from URL first
            const newUrl = window.location.pathname
            window.history.replaceState({}, '', newUrl)
            
            // Dispatch event to notify auth system (this will trigger validation)
            // Use a small delay to ensure localStorage write is complete
            setTimeout(() => {
                console.log('[LandingPage] ✅ Dispatching auth-token-stored event')
                console.log('[LandingPage] ✅ Token in localStorage before dispatch:', !!localStorage.getItem('token'))
                window.dispatchEvent(new Event('auth-token-stored'))
            }, 50) // Small delay to ensure localStorage is written
            
            // Fallback: Also trigger a storage event in case the event listener doesn't work
            // This ensures the auth hook picks up the token change
            setTimeout(() => {
                if (typeof window !== 'undefined' && window.dispatchEvent) {
                    const storageEvent = new StorageEvent('storage', {
                        key: 'token',
                        newValue: token,
                        storageArea: localStorage,
                    })
                    window.dispatchEvent(storageEvent)
                }
            }, 100)
            
            // Aggressive redirect: If auth validation fails or takes too long, redirect anyway
            // The dashboard will handle authentication with the token in localStorage
            const redirectTimeout = setTimeout(() => {
                if (redirectUrlRef.current) {
                    console.warn('[LandingPage] ⚠️ Timeout: Redirecting with token - dashboard will validate')
                    const url = redirectUrlRef.current
                    redirectUrlRef.current = null
                    // Clear the timeout reference
                    // @ts-ignore
                    if (redirectUrlRef.current?._timeout) {
                        // @ts-ignore
                        clearTimeout(redirectUrlRef.current._timeout)
                    }
                    router.replace(url)
                }
            }, 3000) // 3 second timeout - give validation more time
            
            // Store timeout ID so we can clear it if redirect happens earlier
            // @ts-ignore
            redirectUrlRef.current._timeout = redirectTimeout
        }
    }, [searchParams])
    
    // Also check URL on mount for token (in case it was missed) - run immediately
    useEffect(() => {
        // Double-check URL for token on mount - run this immediately
        if (!hasProcessedToken.current && typeof window !== 'undefined') {
            const currentSearch = window.location.search
            const urlParams = currentSearch ? new URLSearchParams(currentSearch) : null
            const urlToken = urlParams?.get('token')
            
            if (urlToken) {
                console.log('[LandingPage] 🔍 Found token in URL on mount check! Processing immediately...')
                // Process token immediately
                hasProcessedToken.current = true
                
                let decodedToken = urlToken
                try {
                    decodedToken = decodeURIComponent(urlToken)
                } catch (e) {
                    console.warn('[LandingPage] Token decode failed on mount, using as-is')
                }
                
                localStorage.setItem('token', decodedToken)
                localStorage.setItem('oauth_token_fresh', 'true')
                localStorage.setItem('oauth_token_timestamp', Date.now().toString())
                
                setTimeout(() => {
                    localStorage.removeItem('oauth_token_fresh')
                    localStorage.removeItem('oauth_token_timestamp')
                }, 10000)
                
                console.log('[LandingPage] ✅ Token stored from mount check, length:', decodedToken.length)
                
                // Dispatch event to trigger validation
                setTimeout(() => {
                    window.dispatchEvent(new Event('auth-token-stored'))
                }, 50)
            }
        }
    }, []) // Empty deps - run once on mount
    
    // Wait for auth validation to complete before redirecting
    useEffect(() => {
        const urlHasToken = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') !== null : false
        console.log('[LandingPage] Auth state check:', { 
            hasToken: hasProcessedToken.current, 
            authLoading, 
            isAuthenticated, 
            hasRedirectUrl: !!redirectUrlRef.current,
            tokenInStorage: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
            urlHasToken
        })
        
        // If we processed the token and have a redirect URL
        if (hasProcessedToken.current && redirectUrlRef.current) {
            // Wait for auth loading to complete (success or failure)
            if (!authLoading) {
                const nextUrl = redirectUrlRef.current
                
                // Clear timeout if we're redirecting now
                // @ts-ignore
                if (redirectUrlRef.current?._timeout) {
                    // @ts-ignore
                    clearTimeout(redirectUrlRef.current._timeout)
                }
                
                // If authenticated, redirect immediately
                if (isAuthenticated) {
                    console.log('[LandingPage] ✅ Authentication complete, redirecting to:', nextUrl)
                    redirectUrlRef.current = null
                    router.replace(nextUrl)
                    return
                }
                
                // If not authenticated but we have a token, redirect anyway
                // The dashboard will handle authentication validation
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                if (token) {
                    console.log('[LandingPage] ⏳ Token exists but auth state not ready, redirecting anyway')
                    // Redirect immediately - dashboard will validate the token
                    const url = redirectUrlRef.current
                    redirectUrlRef.current = null
                    router.replace(url)
                    return
                }
            }
        }
    }, [authLoading, isAuthenticated, router])
    
    // Show loading state while processing OAuth token
    if (hasProcessedToken.current && (authLoading || !isAuthenticated)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Signing you in...</p>
                    <p className="text-xs text-muted-foreground">Please wait while we verify your account</p>
                </div>
            </div>
        )
    }

    useEffect(() => {
        setVideoLoaded(false);
        setVideoError(false);

        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [theme, effectiveTheme]);

    const handleVideoLoad = () => {
        setVideoLoaded(true);
    };

    const handleVideoError = () => {
        setVideoError(true);
    };

    return (
        <div className="flex flex-col min-h-[100dvh] text-gray-900 dark:text-white transition-colors duration-300">
            <main className="flex-1">
                <section className="w-full py-14 md:py-12 lg:py-16 xl:py-24">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col w-full gap-y-16 md:gap-y-20 lg:gap-y-24">
                            <div className="flex flex-col justify-center space-y-10 text-center relative z-20">
                                <div className="space-y-8">
                                    <h1 className="text-2xl font-bold tracking-tight sm:text-4xl xl:text-5xl/none bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent leading-snug relative z-20 pb-4">
                                        Track Your Trades, Master Your Strategy
                                    </h1>
                                    <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 md:text-xl leading-relaxed mt-4 relative z-10">
                                        The comprehensive trading journal that helps you analyze performance, identify patterns, and improve your trading decisions.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row w-full justify-center gap-4">
                                    <Link 
                                        href={"/dashboard"} 
                                        prefetch={true}
                                        className="flex justify-center items-center px-8 py-3 h-12 bg-[#2E9987] hover:bg-[#267a6d] dark:bg-[hsl(var(--chart-1))] dark:hover:bg-[hsl(var(--chart-1)/0.9)] shadow-[0_0_0_6px_rgba(50,169,151,0.1),0_0_0_2px_rgba(50,169,151,0.25),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_6px_rgba(50,169,151,0.2),0_0_0_2px_rgba(50,169,151,0.35),0_2px_4px_rgba(0,0,0,0.2),0_2px_3px_-1px_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_6px_hsl(var(--chart-1)/0.1),0_0_0_2px_hsl(var(--chart-1)/0.25),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_0_6px_hsl(var(--chart-1)/0.2),0_0_0_2px_hsl(var(--chart-1)/0.35),0_2px_4px_rgba(0,0,0,0.2),0_2px_3px_-1px_rgba(0,0,0,0.2)] rounded-xl transition-all duration-200">
                                        <span className="font-semibold text-sm text-white">Get Started</span>
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Trust Indicators */}
                            <div className="flex flex-col items-center space-y-4 py-8">
                                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Trusted by 1000+ traders</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>99.9% uptime</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Bank-level security</span>
                                    </div>
                                </div>
                                
                                {/* Coming Soon Badge */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full">
                                        <span className="text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                                            Coming Soon: AI-Powered Self-Reflection
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex w-full items-center justify-center relative rounded-lg">
                                <div className="relative w-full h-full">
                                    <span className="absolute inset-[-12px] md:inset-[-24px] bg-[rgba(50,169,151,0.15)] dark:bg-[hsl(var(--chart-1)/0.15)] rounded-[14.5867px] -z-10 animate-pulse"></span>
                                    <span className="absolute inset-[-4px] md:inset-[-8px] bg-[rgba(50,169,151,0.25)] dark:bg-[hsl(var(--chart-1)/0.25)] rounded-[14.5867px] -z-20 animate-pulse"></span>
                                    <span className="absolute inset-0 shadow-[0_9.1167px_13.675px_-2.735px_rgba(0,0,0,0.1),0_3.64667px_5.47px_-3.64667px_rgba(0,0,0,0.1)] md:shadow-[0_18.2333px_27.35px_-5.47px_rgba(0,0,0,0.1),0_7.29333px_10.94px_-7.29333px_rgba(0,0,0,0.1)] dark:shadow-[0_9.1167px_13.675px_-2.735px_hsl(var(--chart-1)/0.1),0_3.64667px_5.47px_-3.64667px_hsl(var(--chart-1)/0.1)] md:dark:shadow-[0_18.2333px_27.35px_-5.47px_hsl(var(--chart-1)/0.1),0_7.29333px_10.94px_-7.29333px_hsl(var(--chart-1)/0.1)] rounded-[14.5867px] -z-30"></span>
                                    {!videoLoaded && !videoError && (
                                        <div className="w-full aspect-video flex items-center justify-center bg-gray-100 dark:bg-black rounded-[14.5867px] border-[1.82333px] border-[#E5E7EB] dark:border-gray-800">
                                            <Skeleton className="w-full aspect-video rounded-[14.5867px]" />
                                        </div>
                                    )}
                                    {videoError && (
                                        <div className="w-full aspect-video flex items-center justify-center bg-gray-100 dark:bg-black rounded-lg">
                                            <p className="text-red-500">Failed to load video</p>
                                        </div>
                                    )}
                                    <video
                                        ref={videoRef}
                                        preload="metadata"
                                        loop
                                        muted
                                        autoPlay
                                        playsInline
                                        className={`w-full h-full rounded-[14.5867px] border-[1.82333px] border-[#E5E7EB] dark:border-gray-800 ${videoLoaded ? 'block' : 'hidden'}`}
                                        onLoadedData={handleVideoLoad}
                                        onError={handleVideoError}
                                    >
                                        <source src={effectiveTheme === "dark" ? "https://fhvmtnvjiotzztimdxbi.supabase.co/storage/v1/object/public/assets/demo-dark.mp4" : "https://fhvmtnvjiotzztimdxbi.supabase.co/storage/v1/object/public/assets/demo.mp4"} type="video/mp4" />
                                        <track
                                            src="/path/to/captions.vtt"
                                            kind="subtitles"
                                            srcLang="en"
                                            label="English"
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="features" className="w-full py-6 md:py-12 lg:py-16 xl:py-24">
                    <Features />
                </section>
            </main>
        </div>
    )
}