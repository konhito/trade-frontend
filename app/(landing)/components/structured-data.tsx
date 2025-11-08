'use client'

import { useEffect } from 'react'

export function StructuredData() {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "MyTradeJournal",
      "url": "https://www.mytradejournal.co.in",
      "logo": "https://www.mytradejournal.co.in/logo2.png",
      "description": "Professional trading journal and analytics platform for traders to track, analyze, and improve their trading performance.",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "MyTradeJournal99@gmail.com",
        "contactType": "Customer Service",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://youtube.com/@decayhunters",
        "https://t.me/DECAYHUNTERS"
      ]
    }

    // SoftwareApplication Schema
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "MyTradeJournal",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "url": "https://www.mytradejournal.co.in",
      "description": "Comprehensive trading journal platform that helps traders track, analyze, and improve their trading performance across multiple brokers with AI-powered analytics.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1000"
      },
      "featureList": [
        "Trade Journaling",
        "Multi-Broker Support",
        "AI-Powered Analytics",
        "Performance Tracking",
        "Strategy Analysis",
        "Risk Management",
        "Portfolio Visualization"
      ]
    }

    // WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MyTradeJournal",
      "url": "https://www.mytradejournal.co.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.mytradejournal.co.in/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }

    // Breadcrumb Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.mytradejournal.co.in"
        }
      ]
    }

    // Add all schemas to the page
    const schemas = [
      organizationSchema,
      softwareApplicationSchema,
      websiteSchema,
      breadcrumbSchema
    ]

    schemas.forEach((schema, index) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = `structured-data-${index}`
      script.text = JSON.stringify(schema)
      document.head.appendChild(script)
    })

    return () => {
      // Cleanup on unmount
      schemas.forEach((_, index) => {
        const script = document.getElementById(`structured-data-${index}`)
        if (script) {
          script.remove()
        }
      })
    }
  }, [])

  return null
}

