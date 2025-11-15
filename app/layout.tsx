import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-provider";
import TopLoader from "@/components/top-loader";
import Script from "next/script"
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MyTradeJournal - Professional Trading Journal & Analytics Platform",
    template: "%s | MyTradeJournal"
  },
  description: "Record, Review and Refine your trading journey. Track, analyze, and improve your trading performance with powerful AI-powered analytics across multiple brokers.",
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
    'trading diary',
    'AI trading analytics',
    'multi-broker trading',
    'trading strategy analysis',
    'trade performance tracking'
  ],
  metadataBase: new URL('https://www.mytradejournal.co.in'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mytradejournal.co.in',
    siteName: 'MyTradeJournal',
    title: "MyTradeJournal - Professional Trading Journal & Analytics Platform",
    description: "Record, Review and Refine your trading journey. Advanced analytics platform for modern traders.",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'MyTradeJournal Open Graph Image',
      },
      {
        url: '/twitter-image.png',
        width: 1200,
        height: 630,
        alt: 'MyTradeJournal Twitter Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MyTradeJournal - Professional Trading Journal & Analytics Platform",
    description: "Record, Review and Refine your trading journey. Advanced analytics platform for modern traders.",
    images: ['/twitter-image.png'],
  },
  icons: {
    // Default icons - using 512x512 favicon everywhere
    icon: [
      { url: '/android-chrome-512x512.png', sizes: 'any' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '32x32' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '16x16' },
    ],
    // Apple-specific icons
    apple: [
      { url: '/android-chrome-512x512.png', sizes: '180x180', type: 'image/png' },
    ],
    // Other platform icons
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#000000'
      },
      {
        rel: 'android-chrome',
        sizes: '192x192',
        url: '/android-chrome-512x512.png',
      },
      {
        rel: 'android-chrome',
        sizes: '512x512',
        url: '/android-chrome-512x512.png',
      }
    ]
  },
  // Web manifest for PWA support
  manifest: '/site.webmanifest',
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
  alternates: {
    canonical: 'https://www.mytradejournal.co.in',
  },
  category: 'Finance',
  classification: 'Trading Software',
  other: {
    'google': 'notranslate',
  },
  authors: [{ name: 'MyTradeJournal Team' }],
  creator: 'MyTradeJournal',
  publisher: 'MyTradeJournal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background" translate="no">
      <head>
        {/* Prevent Google Translate */}
        <meta name="google" content="notranslate" />
        <meta name="googlebot" content="notranslate" />
        <meta name="googlebot-news" content="notranslate" />

        {/* Prevent Google Translate DOM manipulation */}
        <Script id="prevent-google-translate" strategy="beforeInteractive">
          {`
            // Function to prevent Google Translate from modifying the DOM
            function preventGoogleTranslate() {
              // Prevent Google Translate from modifying the DOM
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'childList' && 
                      mutation.target.classList && 
                      mutation.target.classList.contains('goog-te-menu-frame')) {
                    // Prevent Google Translate from modifying our React components
                    const elements = document.querySelectorAll('[class*="goog-te-"]');
                    elements.forEach((el) => {
                      if (el.tagName === 'SPAN' && el.parentElement) {
                        // Preserve the original text content
                        const originalText = el.getAttribute('data-original-text') || el.textContent;
                        el.textContent = originalText;
                      }
                    });
                  }
                });
              });

              // Start observing the document with the configured parameters
              observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
              });

              // Prevent Google Translate from initializing
              if (window.google && window.google.translate) {
                window.google.translate.TranslateElement = function() {
                  return {
                    translate: function() {
                      return false;
                    }
                  };
                };
              }
            }

            // Run the prevention function
            preventGoogleTranslate();
          `}
        </Script>

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/android-chrome-512x512.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="180x180"
          href="/android-chrome-512x512.png"
        />
        <style>
          {`
            /* Base layout */
            html {
              margin: 0;
              padding: 0;
              overflow-y: scroll !important;
              overflow-x: hidden !important;
              scrollbar-gutter: stable !important;
              -ms-overflow-style: scrollbar !important;
            }

            body {
              min-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow-x: hidden !important;
            }

            /* Style the scrollbar */
            ::-webkit-scrollbar {
              width: 14px !important;
              background-color: transparent !important;
            }

            ::-webkit-scrollbar-track {
              background: hsl(var(--background)) !important;
              border-left: 1px solid hsl(var(--border)) !important;
            }

            ::-webkit-scrollbar-thumb {
              background: hsl(var(--muted-foreground) / 0.3) !important;
              border-radius: 7px !important;
              border: 3px solid hsl(var(--background)) !important;
              min-height: 40px !important;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--muted-foreground) / 0.4) !important;
            }

            /* Firefox scrollbar styles */
            * {
              scrollbar-width: thin !important;
              scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent !important;
            }
          `}
        </style>

      </head>
      <body className={inter.className + " min-h-screen overflow-x-hidden w-screen"}>
        <AuthProvider>
          <TopLoader />
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
