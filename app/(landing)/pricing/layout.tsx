import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect trading journal plan for your needs. Free plan available with premium features for serious traders. Flexible pricing with no long-term contracts.',
  keywords: [
    'trading journal pricing',
    'trade journal cost',
    'trading software pricing',
    'trading analytics subscription',
    'affordable trading journal',
    'free trading journal',
    'premium trading tools'
  ],
  openGraph: {
    title: 'Pricing Plans | MyTradeJournal',
    description: 'Choose the perfect trading journal plan for your needs. Free plan available with premium features for serious traders.',
    url: 'https://www.mytradejournal.co.in/pricing',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


