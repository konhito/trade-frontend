import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with MyTradeJournal. Contact our support team for questions, feedback, or assistance with your trading journal. We\'re here to help you succeed.',
  keywords: [
    'contact MyTradeJournal',
    'trading journal support',
    'customer service',
    'help desk',
    'trading software contact',
    'support email'
  ],
  openGraph: {
    title: 'Contact Us | MyTradeJournal',
    description: 'Get in touch with MyTradeJournal. Contact our support team for questions, feedback, or assistance.',
    url: 'https://www.mytradejournal.co.in/contact',
  },
  alternates: {
    canonical: 'https://www.mytradejournal.co.in/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


