'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Job, JobType, JobStatus } from '@/lib/types'

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Scheduled', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  completed: { label: 'Completed', color: '#63D866', bg: 'rgba(99, 216, 102, 0.15)', border: 'rgba(99, 216, 102, 0.3)' },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)' },
}

const TYPE_CONFIG: Record<JobType, { label: string; icon: string; color: string }> = {
  cleaning: { label: 'Cleaning', icon: '🧹', color: '#00D9FF' },
  ac_maintenance: { label: 'AC Service', icon: '❄️', color: '#F59E0B' },
}

interface JobFormData {
  propertyName: string
  clientName: string
  type: JobType
  scheduledDate: string
  scheduledTime: string
  assignedTo: string
  notes: string
}

const EMPTY_FORM: JobFormData = {
  propertyName: '',
  clientName: '',
  type: 'cleaning',
  scheduledDate: '',
  scheduledTime: '09:00',
  assignedTo: '',
  notes: '',
}

function isOverdue(job: Job): boolean {
  if (job.status === 'completed' || job.status === 'cancelled') return false
  const now = new Date()
  const scheduled = new Date(`${job.scheduledDate}T${job.scheduledTime}`)
  return scheduled < now
}

function formatJobDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const jobDate = new Date(dateStr + 'T00:00:00')
  jobDate.setHours(0, 0, 0, 0)

  if (jobDate.getTime() === today.getTime()) return 'Today'
  if (jobDate.getTime() === tomorrow.getTime()) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function JobsView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<JobFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<JobType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all')

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs')
      if (res.ok) setJobs(await res.json())
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const updateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      })
      if (res.ok) fetchJobs()
    } catch (err) {
      console.error('Failed to update job:', err)
    }
  }

  const handleSubmit = async () => {
    if (!form.propertyName.trim() || !form.scheduledDate) return
    setSaving(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(EMPTY_FORM)
        fetchJobs()
      }
    } catch (err) {
      console.error('Failed to save job:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = jobs
    .filter(j => {
      if (filterType !== 'all' && j.type !== filterType) return false
      if (filterStatus !== 'all' && j.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      // Active jobs first, then by date
      const aActive = a.status === 'in_progress' ? 0 : a.status === 'scheduled' ? 1 : 2
      const bActive = b.status === 'in_progress' ? 0 : b.status === 'scheduled' ? 1 : 2
      if (aActive !== bActive) return aActive - bActive
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    })

  // Stats
  const stats = {
    total: jobs.length,
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    overdue: jobs.filter(isOverdue).length,
    cleaning: jobs.filter(j => j.type === 'cleaning' && j.status !== 'completed' && j.status !== 'cancelled').length,
    ac: jobs.filter(j => j.type === 'ac_maintenance' && j.status !== 'completed' && j.status !== 'cancelled').length,
  }

  // Group jobs by date for calendar-like view
  const groupedByDate = filtered.reduce<Record<string, Job[]>>((acc, job) => {
    const date = job.scheduledDate
    if (!acc[date]) acc[date] = []
    acc[date].push(job)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort()

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🔧 Jobs</h2>
          <p className="text-sm text-gray-400">Cleaning and AC maintenance scheduling</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            color: '#00D9FF',
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)',
          }}
        >
          + New Job
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', value: stats.scheduled, icon: '📅', color: '#3B82F6' },
          { label: 'In Progress', value: stats.inProgress, icon: '⚡', color: '#F59E0B' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: '#63D866' },
          { label: 'Overdue', value: stats.overdue, icon: '⚠️', color: stats.overdue > 0 ? '#EF4444' : '#6B7280' },
        ].map(s => (
          <div
            key={s.label}
            className="glass rounded-xl p-5 hover-glow-subtle transition-all duration-300"
            style={{ boxShadow: `0 0 20px ${s.color}10` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              {s.label === 'Overdue' && s.value > 0 && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 8px #EF4444',
                    animation: 'livePulse 1s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Type Summary Bar */}
      <div className="flex items-center gap-4">
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
          <span>🧹</span>
          <span className="text-sm text-cyan-400 font-medium">{stats.cleaning} cleaning</span>
        </div>
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
          <span>❄️</span>
          <span className="text-sm text-amber-400 font-medium">{stats.ac} AC service</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Type:</span>
          {(['all', 'cleaning', 'ac_maintenance'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08]'
              }`}
            >
              {t === 'all' ? 'All' : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          {(['all', 'scheduled', 'in_progress', 'completed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08]'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Job List grouped by date */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-4 animate-pulse">🔧</div>
          <p className="text-gray-500 text-sm">Loading jobs...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-400 text-sm">No jobs match your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-semibold text-white">{formatJobDate(date)}</div>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <div className="text-xs text-gray-500 font-mono">{date}</div>
              </div>

              {/* Jobs for this date */}
              <div className="space-y-2">
                {groupedByDate[date].map(job => {
                  const typeConfig = TYPE_CONFIG[job.type]
                  const statusConfig = STATUS_CONFIG[job.status]
                  const overdue = isOverdue(job)

                  return (
                    <div
                      key={job.id}
                      className="glass rounded-xl p-4 hover-glow-subtle transition-all duration-200 group"
                      style={{
                        borderColor: overdue ? 'rgba(239, 68, 68, 0.3)' : undefined,
                        boxShadow: overdue ? '0 0 20px rgba(239, 68, 68, 0.1)' : undefined,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Time */}
                        <div className="text-center min-w-[50px]">
                          <div className="text-sm font-mono text-white font-medium">{job.scheduledTime}</div>
                          <div className="text-[10px] text-gray-600 mt-0.5">
                            {job.type === 'cleaning' ? 'CLEAN' : 'AC'}
                          </div>
                        </div>

                        {/* Type icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${typeConfig.color}15`,
                            border: `1px solid ${typeConfig.color}30`,
                          }}
                        >
                          <span className="text-lg">{typeConfig.icon}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white truncate">{job.propertyName}</span>
                            {overdue && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {job.clientName} · {job.assignedTo}
                          </div>
                          {job.notes && (
                            <div className="text-xs text-gray-600 mt-1 truncate">{job.notes}</div>
                          )}
                        </div>

                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              border: `1px solid ${statusConfig.border}`,
                            }}
                          >
                            {statusConfig.label}
                          </span>

                          {/* Status change buttons */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {job.status === 'scheduled' && (
                              <button
                                onClick={() => updateJobStatus(job.id, 'in_progress')}
                                className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
                                title="Start job"
                              >
                                Start
                              </button>
                            )}
                            {(job.status === 'scheduled' || job.status === 'in_progress') && (
                              <button
                                onClick={() => updateJobStatus(job.id, 'completed')}
                                className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                                title="Complete job"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div
            className="relative w-full max-w-lg glass-strong rounded-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 60px rgba(0, 217, 255, 0.15), 0 0 120px rgba(168, 85, 247, 0.08)' }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Schedule New Job</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Property Name *</label>
                  <input
                    type="text"
                    value={form.propertyName}
                    onChange={e => setForm(f => ({ ...f, propertyName: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Property name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Job Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as JobType }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="cleaning">🧹 Cleaning</option>
                    <option value="ac_maintenance">❄️ AC Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Time</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Assigned To</label>
                <input
                  type="text"
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="Team A, Carlos, etc."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Job details, special instructions..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.propertyName.trim() || !form.scheduledDate}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                }}
              >
                {saving ? 'Scheduling...' : 'Schedule Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
