import type { Metadata } from 'next'
import PublicTrackerAdmin from '@/components/public-tracker-admin'

export const metadata: Metadata = {
  title: 'Tracker Manager',
  robots: { index: false, follow: false },
}

export default function TrackerAdminPage() {
  return <PublicTrackerAdmin />
}
