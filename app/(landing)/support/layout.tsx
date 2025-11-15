import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support & Help Center',
  description: 'Get help with MyTradeJournal. Find answers to common questions, contact support, or use our AI-powered support assistant for instant help.',
  keywords: [
    'trading journal support',
    'trade journal help',
    'trading software support',
    'customer service',
    'help center',
    'FAQ trading journal'
  ],
  openGraph: {
    title: 'Support & Help Center | MyTradeJournal',
    description: 'Get help with MyTradeJournal. Find answers to common questions, contact support, or use our AI-powered support assistant.',
    url: 'https://www.mytradejournal.co.in/support',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in/support',
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

