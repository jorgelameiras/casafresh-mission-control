'use client'

import { useState, useEffect } from 'react'

interface CalendarJob {
  id: string
  date: string // YYYY-MM-DD
  type: 'cleaning' | 'ac' | 'inspection' | 'call'
  property: string
  time: string // HH:MM
  notes: string
  completed: boolean
}

const JOBS_KEY = 'casafresh-calendar-jobs'

const JOB_TYPES: { value: CalendarJob['type']; label: string; icon: string; color: string }[] = [
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', color: '#00D9FF' },
  { value: 'ac', label: 'AC Maintenance', icon: '❄️', color: '#A855F7' },
  { value: 'inspection', label: 'Inspection', icon: '🔍', color: '#EAB308' },
  { value: 'call', label: 'Client Call', icon: '📞', color: '#22C55E' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function jobTypeInfo(type: CalendarJob['type']) {
  return JOB_TYPES.find(t => t.value === type) ?? JOB_TYPES[0]
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function CalendarView() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [jobs, setJobs] = useState<CalendarJob[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newJob, setNewJob] = useState<Omit<CalendarJob, 'id' | 'completed'>>({
    date: '',
    type: 'cleaning',
    property: '',
    time: '',
    notes: '',
  })

  // Load jobs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(JOBS_KEY)
      if (saved) setJobs(JSON.parse(saved))
    } catch {}
  }, [])

  const saveJobs = (updated: CalendarJob[]) => {
    setJobs(updated)
    try { localStorage.setItem(JOBS_KEY, JSON.stringify(updated)) } catch {}
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const goToday = () => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(dateKey(today.getFullYear(), today.getMonth(), today.getDate()))
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const jobsForDate = (key: string) => jobs.filter(j => j.date === key)

  const handleDayClick = (day: number) => {
    const key = dateKey(year, month, day)
    setSelectedDay(key)
    setShowAddForm(false)
    setNewJob(prev => ({ ...prev, date: key }))
  }

  const addJob = () => {
    if (!newJob.property.trim() || !newJob.date) return
    const job: CalendarJob = { ...newJob, id: uid(), completed: false }
    saveJobs([...jobs, job])
    setShowAddForm(false)
    setNewJob(prev => ({ ...prev, property: '', time: '', notes: '' }))
  }

  const toggleComplete = (id: string) => {
    saveJobs(jobs.map(j => j.id === id ? { ...j, completed: !j.completed } : j))
  }

  const deleteJob = (id: string) => {
    saveJobs(jobs.filter(j => j.id !== id))
  }

  const selectedJobs = selectedDay ? jobsForDate(selectedDay) : []
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="flex-1 p-4 md:p-8 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📅 Calendar</h2>
        <p className="text-sm text-gray-400">Schedule and track cleaning jobs, AC maintenance, and calls</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Calendar Panel */}
        <div
          className="flex-1 rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(10,15,26,0.9) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              ‹
            </button>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">
                {MONTHS[month]} {year}
              </h3>
              <button
                onClick={goToday}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                style={{
                  background: 'rgba(0, 217, 255, 0.12)',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  color: '#00D9FF',
                }}
              >
                Today
              </button>
            </div>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              ›
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />
              const key = dateKey(year, month, day)
              const dayJobs = jobsForDate(key)
              const isToday = key === todayKey
              const isSelected = key === selectedDay

              return (
                <button
                  key={key}
                  onClick={() => handleDayClick(day)}
                  className="relative aspect-square rounded-lg flex flex-col items-center justify-start pt-2 transition-all hover:scale-105"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(0,217,255,0.2) 0%, rgba(168,85,247,0.2) 100%)'
                      : isToday
                      ? 'rgba(0, 217, 255, 0.08)'
                      : 'rgba(255,255,255,0.02)',
                    border: isSelected
                      ? '1px solid rgba(0, 217, 255, 0.6)'
                      : isToday
                      ? '1px solid rgba(0, 217, 255, 0.25)'
                      : '1px solid transparent',
                    boxShadow: isSelected ? '0 0 16px rgba(0,217,255,0.2)' : 'none',
                  }}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'text-cyan-400' : isSelected ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {day}
                  </span>
                  {/* Job dots */}
                  {dayJobs.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                      {dayJobs.slice(0, 4).map(j => (
                        <div
                          key={j.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: jobTypeInfo(j.type).color, opacity: j.completed ? 0.4 : 1 }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-3">
            {JOB_TYPES.map(t => (
              <div key={t.value} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div
          className="xl:w-80 rounded-xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(10,15,26,0.9) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {selectedDay ? (
            <>
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold">
                    {parseLocalDate(selectedDay).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric'
                    })}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:scale-105 font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,217,255,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                    border: '1px solid rgba(0,217,255,0.35)',
                    color: '#00D9FF',
                    boxShadow: '0 0 12px rgba(0,217,255,0.15)',
                  }}
                >
                  + Add Job
                </button>
              </div>

              {/* Add Job Form */}
              {showAddForm && (
                <div
                  className="mb-4 p-4 rounded-lg space-y-3"
                  style={{
                    background: 'rgba(0,217,255,0.05)',
                    border: '1px solid rgba(0,217,255,0.2)',
                  }}
                >
                  <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">New Job</p>

                  <select
                    value={newJob.type}
                    onChange={e => setNewJob(p => ({ ...p, type: e.target.value as CalendarJob['type'] }))}
                    className="w-full bg-black/40 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50"
                  >
                    {JOB_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Property name *"
                    value={newJob.property}
                    onChange={e => setNewJob(p => ({ ...p, property: e.target.value }))}
                    className="w-full bg-black/40 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 placeholder-gray-600"
                  />

                  <input
                    type="time"
                    value={newJob.time}
                    onChange={e => setNewJob(p => ({ ...p, time: e.target.value }))}
                    className="w-full bg-black/40 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50"
                  />

                  <textarea
                    placeholder="Notes (optional)"
                    value={newJob.notes}
                    onChange={e => setNewJob(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full bg-black/40 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-cyan-400/50 placeholder-gray-600 resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={addJob}
                      disabled={!newJob.property.trim()}
                      className="flex-1 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #00D9FF22 0%, #A855F722 100%)',
                        border: '1px solid rgba(0,217,255,0.4)',
                        color: '#00D9FF',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              {selectedJobs.length === 0 && !showAddForm && (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-gray-600 text-sm">No jobs scheduled</p>
                  <p className="text-gray-700 text-xs mt-1">Click &quot;+ Add Job&quot; to schedule one</p>
                </div>
              )}

              <div className="space-y-3">
                {selectedJobs
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(job => {
                    const info = jobTypeInfo(job.type)
                    return (
                      <div
                        key={job.id}
                        className="rounded-lg p-4 transition-all"
                        style={{
                          background: job.completed ? 'rgba(255,255,255,0.02)' : `${info.color}0D`,
                          border: `1px solid ${job.completed ? 'rgba(255,255,255,0.05)' : info.color + '33'}`,
                          opacity: job.completed ? 0.6 : 1,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleComplete(job.id)}
                            className="mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              border: `1px solid ${info.color}`,
                              background: job.completed ? info.color : 'transparent',
                            }}
                          >
                            {job.completed && <span className="text-black text-[10px] font-bold">✓</span>}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{info.icon}</span>
                              <p
                                className={`text-sm font-medium truncate ${job.completed ? 'line-through text-gray-500' : 'text-white'}`}
                              >
                                {job.property}
                              </p>
                            </div>
                            <p className="text-xs mt-1" style={{ color: info.color + 'CC' }}>
                              {info.label}{job.time ? ` · ${job.time}` : ''}
                            </p>
                            {job.notes && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-sm"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-400 font-medium">Select a day</p>
              <p className="text-gray-600 text-sm mt-1">Click any date to view or add jobs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
