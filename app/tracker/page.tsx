import type { Metadata } from 'next'
import PublicTracker from '@/components/public-tracker'

export const metadata: Metadata = {
  title: 'DECAY HUNTERS — P&L Tracker',
  description: 'Daily strategy performance, cumulative P&L, drawdown, and trading history.',
  alternates: { canonical: '/tracker' },
  openGraph: { url: '/tracker' },
}

export default function TrackerPage() {
  return <PublicTracker />
}
