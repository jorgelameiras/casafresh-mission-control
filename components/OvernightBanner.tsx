'use client'

import { useEffect, useState } from 'react'

function isOvernightHour(hour: number): boolean {
  // Between 11 PM (23) and 7 AM (7)
  return hour >= 23 || hour < 7
}

function formatMinutesAgo(mtimeMs: number | null): string {
  if (!mtimeMs) return 'unknown'
  const diff = Date.now() - mtimeMs
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function OvernightBanner() {
  const [show, setShow] = useState(false)
  const [lastActivity, setLastActivity] = useState<number | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    async function check() {
      const hour = new Date().getHours()
      if (!isOvernightHour(hour)) {
        setShow(false)
        return
      }
      setShow(true)
      try {
        const res = await fetch('/api/memory')
        if (res.ok) {
          const data = await res.json()
          setLastActivity(data.overnightLog?.mtime ?? null)
        }
      } catch {
        // silently fail
      }
    }

    check()
    const interval = setInterval(() => {
      setTick(n => n + 1)
      check()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Tick every 30s to keep the "X min ago" fresh
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  if (!show) return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 border-b text-[11px]"
      style={{
        backgroundColor: '#0d1020',
        borderColor: '#2d1a4a',
        color: '#a78bfa',
      }}
    >
      <span>🌙</span>
      <span className="font-medium">Jarvis is working overnight</span>
      <span className="text-purple-700">—</span>
      <span className="text-purple-600">
        last activity: <span className="font-mono">{formatMinutesAgo(lastActivity)}</span>
      </span>
    </div>
  )
}
