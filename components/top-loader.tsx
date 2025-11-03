'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isDashboard = pathname?.startsWith('/dashboard') || false

  // Kick off on initial load
  useEffect(() => {
    start()
    // complete shortly after mount
    const t = setTimeout(complete, 500)
    return () => clearTimeout(t)
  }, [])

  // Trigger on route changes
  useEffect(() => {
    start()
    // simulate load progression then complete
    const t1 = setTimeout(() => setProgress(80), 150)
    const t2 = setTimeout(complete, 450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function start() {
    setVisible(true)
    setProgress(15)
    if (timerRef.current) clearTimeout(timerRef.current)
    // gentle ramp
    timerRef.current = setTimeout(() => setProgress(50), 120)
  }

  function complete() {
    setProgress(100)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
  }

  if (!visible) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: isDashboard ? 64 : 0, // 64px is header height on dashboard
        left: 0,
        height: 2,
        width: '100%',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          height: 2,
          width: `${progress}%`,
          background: '#10b981', // emerald-500
          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          transition: 'width 200ms ease-out, opacity 200ms ease-out'
        }}
      />
    </div>
  )
}


