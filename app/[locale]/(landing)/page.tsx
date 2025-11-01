'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from '@/context/theme-provider'
import Features from './components/features'
import Partners from './components/partners'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/locales/client'
import { useDashboardPrefetch } from '@/hooks/use-prefetch'


export default function LandingPage() {
    const t = useI18n()
    const { theme, effectiveTheme } = useTheme();
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Prefetch dashboard data if user is authenticated
    useDashboardPrefetch();

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
                                        {t('landing.title')}
                                    </h1>
                                    <p className="mx-auto max-w-[700px] text-gray-600 dark:text-gray-300 md:text-xl leading-relaxed mt-4 relative z-10">
                                        {t('landing.description')}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row w-full justify-center gap-4">
                                    <Link 
                                        href={"/dashboard"} 
                                        prefetch={true}
                                        className="flex justify-center items-center px-8 py-3 h-12 bg-[#2E9987] hover:bg-[#267a6d] dark:bg-[hsl(var(--chart-1))] dark:hover:bg-[hsl(var(--chart-1)/0.9)] shadow-[0_0_0_6px_rgba(50,169,151,0.1),0_0_0_2px_rgba(50,169,151,0.25),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_6px_rgba(50,169,151,0.2),0_0_0_2px_rgba(50,169,151,0.35),0_2px_4px_rgba(0,0,0,0.2),0_2px_3px_-1px_rgba(0,0,0,0.2)] dark:shadow-[0_0_0_6px_hsl(var(--chart-1)/0.1),0_0_0_2px_hsl(var(--chart-1)/0.25),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_0_6px_hsl(var(--chart-1)/0.2),0_0_0_2px_hsl(var(--chart-1)/0.35),0_2px_4px_rgba(0,0,0,0.2),0_2px_3px_-1px_rgba(0,0,0,0.2)] rounded-xl transition-all duration-200">
                                        <span className="font-semibold text-sm text-white">{t('landing.cta')}</span>
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