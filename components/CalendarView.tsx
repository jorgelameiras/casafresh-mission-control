'use client'

import { useState, useMemo } from 'react'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  category: 'job' | 'agent' | 'cron'
  time?: string
}

const CATEGORY_COLORS: Record<CalendarEvent['category'], { bg: string; border: string; text: string; glow: string }> = {
  job: { bg: 'rgba(0, 217, 255, 0.15)', border: '#00D9FF', text: '#00D9FF', glow: 'rgba(0, 217, 255, 0.4)' },
  agent: { bg: 'rgba(168, 85, 247, 0.15)', border: '#A855F7', text: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
  cron: { bg: 'rgba(99, 216, 102, 0.15)', border: '#63D866', text: '#63D866', glow: 'rgba(99, 216, 102, 0.4)' },
}

const CATEGORY_LABELS: Record<CalendarEvent['category'], string> = {
  job: 'Jobs',
  agent: 'Agent Tasks',
  cron: 'Cron Jobs',
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Market Brief', date: '2026-02-23', category: 'cron', time: '06:00' },
  { id: '2', title: 'Lead Scan', date: '2026-02-23', category: 'agent', time: '08:00' },
  { id: '3', title: 'Client Follow-up', date: '2026-02-24', category: 'job', time: '10:00' },
  { id: '4', title: 'Competitor Analysis', date: '2026-02-25', category: 'agent', time: '14:00' },
  { id: '5', title: 'Email Digest', date: '2026-02-25', category: 'cron', time: '07:00' },
  { id: '6', title: 'Property Listing Review', date: '2026-02-26', category: 'job', time: '11:00' },
  { id: '7', title: 'Overnight Report', date: '2026-02-27', category: 'cron', time: '06:30' },
  { id: '8', title: 'Code Review Batch', date: '2026-02-27', category: 'agent', time: '09:00' },
  { id: '9', title: 'New Listing Alert', date: '2026-02-28', category: 'job', time: '15:00' },
  { id: '10', title: 'Memory Cleanup', date: '2026-03-01', category: 'cron', time: '03:00' },
  { id: '11', title: 'Vendor Outreach', date: '2026-03-02', category: 'job', time: '13:00' },
  { id: '12', title: 'System Health Check', date: '2026-03-03', category: 'cron', time: '00:00' },
  { id: '13', title: 'Content Pipeline', date: '2026-03-05', category: 'agent', time: '10:00' },
  { id: '14', title: 'Social Post Schedule', date: '2026-03-07', category: 'job', time: '16:00' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday-start
}

export default function CalendarView() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    SAMPLE_EVENTS.forEach(event => {
      if (!map[event.date]) map[event.date] = []
      map[event.date].push(event)
    })
    return map
  }, [])

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = []

    // Previous month padding
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    )
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const m = currentMonth === 0 ? 11 : currentMonth - 1
      const y = currentMonth === 0 ? currentYear - 1 : currentYear
      days.push({
        day: d,
        dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
      })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1
      const y = currentMonth === 11 ? currentYear + 1 : currentYear
      days.push({
        day: d,
        dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentYear, currentMonth, daysInMonth, firstDay])

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDate(todayStr)
  }

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : []

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <span style={{ filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))' }}>📅</span>
            Calendar
          </h2>
          <p className="text-sm text-gray-400">Schedule overview and upcoming events</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Category Legend */}
          <div className="hidden md:flex items-center gap-4">
            {(Object.entries(CATEGORY_COLORS) as Array<[CalendarEvent['category'], typeof CATEGORY_COLORS[CalendarEvent['category']]]>).map(([cat, colors]) => (
              <div key={cat} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.border, boxShadow: `0 0 6px ${colors.glow}` }}
                />
                <span className="text-xs text-gray-400">{CATEGORY_LABELS[cat]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div
        className="glass rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(0, 217, 255, 0.05)' }}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            onClick={goToPrevMonth}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover-glow-subtle"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-gray-300 text-lg">‹</span>
          </button>

          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white font-mono tracking-wide">
              {monthName}
            </h3>
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: '#00D9FF',
              }}
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover-glow-subtle"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS.map(day => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => {
            const isToday = cell.dateStr === todayStr
            const isSelected = cell.dateStr === selectedDate
            const dayEvents = eventsByDate[cell.dateStr] ?? []
            const hasEvents = dayEvents.length > 0

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                onClick={() => setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
                className={`
                  relative min-h-[80px] md:min-h-[100px] p-2 border-b border-r border-white/5
                  transition-all duration-200 text-left group
                  ${cell.isCurrentMonth ? '' : 'opacity-30'}
                  ${isSelected ? 'bg-white/5' : 'hover:bg-white/[0.03]'}
                `}
                style={isToday ? {
                  boxShadow: 'inset 0 0 30px rgba(0, 217, 255, 0.08), 0 0 20px rgba(0, 217, 255, 0.05)',
                  background: 'rgba(0, 217, 255, 0.04)',
                } : undefined}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-mono font-medium
                      ${isToday ? 'text-cyan-300' : cell.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
                    `}
                  >
                    {cell.day}
                  </span>
                  {isToday && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: '#00D9FF',
                        boxShadow: '0 0 8px rgba(0, 217, 255, 0.8), 0 0 16px rgba(0, 217, 255, 0.4)',
                        animation: 'glowPulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const colors = CATEGORY_COLORS[event.category]
                    return (
                      <div
                        key={event.id}
                        className="text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate transition-all duration-200 group-hover:scale-[1.02]"
                        style={{
                          backgroundColor: colors.bg,
                          borderLeft: `2px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      >
                        <span className="hidden md:inline">{event.time && `${event.time} `}</span>
                        {event.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>

                {/* Today highlight border */}
                {isToday && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Legend */}
      <div className="flex md:hidden items-center justify-center gap-4 flex-wrap">
        {(Object.entries(CATEGORY_COLORS) as Array<[CalendarEvent['category'], typeof CATEGORY_COLORS[CalendarEvent['category']]]>).map(([cat, colors]) => (
          <div key={cat} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.border, boxShadow: `0 0 4px ${colors.glow}` }}
            />
            <span className="text-[10px] text-gray-500">{CATEGORY_LABELS[cat]}</span>
          </div>
        ))}
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDate && (
        <div
          className="glass rounded-xl p-5 animate-slideIn"
          style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white font-mono">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map(event => {
                const colors = CATEGORY_COLORS[event.category]
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}40`,
                    }}
                  >
                    <div
                      className="w-2 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors.border, boxShadow: `0 0 8px ${colors.glow}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{event.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: colors.text }}>
                        {event.time && <span className="font-mono">{event.time}</span>}
                        <span className="ml-2 opacity-70">{CATEGORY_LABELS[event.category]}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
