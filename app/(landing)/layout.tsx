import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mytradejournal.co.in'),
  title: {
    default: 'MyTradeJournal - Professional Trading Journal & Analytics Platform',
    template: '%s | MyTradeJournal'
  },
  description: 'Centralize and visualize your trading performance across multiple brokers. Track, analyze, and improve your trading journey with powerful AI-powered analytics, trade management, and performance insights.',
  keywords: [
    'trading journal',
    'trade journal',
    'trading analytics',
    'trading performance',
    'trade analysis',
    'trading software',
    'trading platform',
    'stock trading journal',
    'forex trading journal',
    'crypto trading journal',
    'trade management',
    'trading insights',
    'trading statistics',
    'portfolio analysis',
    'trading diary'
  ],
  authors: [{ name: 'MyTradeJournal Team' }],
  creator: 'MyTradeJournal',
  publisher: 'MyTradeJournal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mytradejournal.co.in',
    siteName: 'MyTradeJournal',
    title: 'MyTradeJournal - Professional Trading Journal & Analytics Platform',
    description: 'Track, analyze, and improve your trading performance with powerful AI-powered analytics. Manage trades across multiple brokers with comprehensive insights and statistics.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'MyTradeJournal - Trading Journal Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyTradeJournal - Professional Trading Journal & Analytics Platform',
    description: 'Track, analyze, and improve your trading performance with powerful AI-powered analytics.',
    images: ['/twitter-image.png'],
    creator: '@MyTradeJournal',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in',
  },
  category: 'Finance',
  classification: 'Trading Software',
  other: {
    'google': 'notranslate',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ThemeProvider>
        <div className="px-2 sm:px-6 lg:px-32">
          <SonnerToaster />
          <Toaster />
          <Navbar />
          <div className="mt-8 sm:mt-20 max-w-screen-xl mx-auto">
            {children}
          </div>
          <Footer />
        </div>
    </ThemeProvider>
  );
}
