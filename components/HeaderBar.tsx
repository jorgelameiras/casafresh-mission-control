'use client'

import { useState, useEffect } from 'react'

interface HeaderBarProps {
  agentCount: number
  activeCount: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Working late'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Night shift'
}

export default function HeaderBar({ agentCount, activeCount }: HeaderBarProps) {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [greeting, setGreeting] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))
      setGreeting(getGreeting())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/[0.06]"
      style={{
        background: 'linear-gradient(90deg, rgba(0, 217, 255, 0.03) 0%, rgba(168, 85, 247, 0.03) 50%, rgba(0, 217, 255, 0.03) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Greeting */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-sm font-medium text-white">
            {greeting}, <span className="text-cyan-400">Commander</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">{date}</div>
        </div>
      </div>

      {/* Center: Status */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: activeCount > 0 ? '#63D866' : '#6B7280',
              boxShadow: activeCount > 0 ? '0 0 8px rgba(99, 216, 102, 0.6)' : 'none',
              animation: activeCount > 0 ? 'livePulse 1s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-xs text-gray-400">
            <span className="text-white font-mono font-medium">{activeCount}</span>
            <span className="text-gray-600">/{agentCount}</span>
            {' '}agents active
          </span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">SYS</span>
          <span className="text-xs text-green-400 font-mono">OK</span>
        </div>
      </div>

      {/* Right: Clock */}
      <div className="text-right">
        <div
          className="text-xl font-mono font-bold tracking-widest"
          style={{
            background: 'linear-gradient(90deg, #00D9FF 0%, #A855F7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.3))',
          }}
        >
          {time}
        </div>
      </div>
    </div>
  )
}
