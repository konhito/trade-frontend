import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimers',
  description: 'Important disclaimers and risk disclosures for MyTradeJournal. Understand the risks involved in trading and the limitations of our platform.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Disclaimers | MyTradeJournal',
    description: 'Important disclaimers and risk disclosures for MyTradeJournal. Understand the risks involved in trading.',
    url: 'https://www.mytradejournal.co.in/disclaimers',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in/disclaimers',
  },
}

export default function DisclaimersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


