'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead, LeadStatus, LeadSource } from '@/lib/types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'New', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  contacted: { label: 'Contacted', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' },
  call_booked: { label: 'Call Booked', color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.15)', border: 'rgba(0, 217, 255, 0.3)' },
  proposal_sent: { label: 'Proposal Sent', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  closed_won: { label: 'Closed Won', color: '#63D866', bg: 'rgba(99, 216, 102, 0.15)', border: 'rgba(99, 216, 102, 0.3)' },
  closed_lost: { label: 'Closed Lost', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
}

const SOURCE_ICONS: Record<LeadSource, string> = {
  upwork: '💼',
  twitter: '🐦',
  discord: '💬',
  reddit: '🔶',
  referral: '🤝',
  website: '🌐',
  cold_call: '📞',
  other: '📌',
}

const PIPELINE_STAGES: LeadStatus[] = ['new', 'contacted', 'call_booked', 'proposal_sent', 'closed_won', 'closed_lost']

interface LeadFormData {
  name: string
  email: string
  source: LeadSource
  status: LeadStatus
  estimatedValue: number
  setupType: 'basic' | 'business' | 'enterprise'
  notes: string
  nextFollowUpDate: string
}

const EMPTY_FORM: LeadFormData = {
  name: '',
  email: '',
  source: 'website',
  status: 'new',
  estimatedValue: 0,
  setupType: 'basic',
  notes: '',
  nextFollowUpDate: '',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'pipeline' | 'analytics'>('pipeline')

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      if (res.ok) setLeads(await res.json())
    } catch (err) {
      console.error('Failed to fetch leads:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus, lastContactDate: new Date().toISOString().split('T')[0] }),
      })
      if (res.ok) fetchLeads()
    } catch (err) {
      console.error('Failed to update lead:', err)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(EMPTY_FORM)
        fetchLeads()
      }
    } catch (err) {
      console.error('Failed to save lead:', err)
    } finally {
      setSaving(false)
    }
  }

  // Analytics calculations
  const totalRevenue = leads.filter(l => l.status === 'closed_won').reduce((sum, l) => sum + l.actualRevenue, 0)
  const pipelineValue = leads.filter(l => !['closed_won', 'closed_lost'].includes(l.status)).reduce((sum, l) => sum + l.estimatedValue, 0)
  const closedDeals = leads.filter(l => l.status === 'closed_won' || l.status === 'closed_lost')
  const winRate = closedDeals.length > 0
    ? Math.round((leads.filter(l => l.status === 'closed_won').length / closedDeals.length) * 100)
    : 0

  // Source breakdown
  const sourceBreakdown = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1
    return acc
  }, {})

  // Funnel data
  const funnelData = PIPELINE_STAGES.map(stage => ({
    stage,
    count: leads.filter(l => l.status === stage).length,
    ...STATUS_CONFIG[stage],
  }))

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">📋 Lead Pipeline</h2>
          <p className="text-sm text-gray-400">Track leads from first contact to close</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border border-white/10">
            {(['pipeline', 'analytics'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-white/[0.02] text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode === 'pipeline' ? 'Pipeline' : 'Analytics'}
              </button>
            ))}
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
            + Add Lead
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: String(leads.length), icon: '📋', color: '#00D9FF' },
          { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: '💰', color: '#A855F7' },
          { label: 'Revenue Closed', value: formatCurrency(totalRevenue), icon: '✅', color: '#63D866' },
          { label: 'Win Rate', value: `${winRate}%`, icon: '🎯', color: '#F59E0B' },
        ].map(s => (
          <div
            key={s.label}
            className="glass rounded-xl p-5 hover-glow-subtle transition-all duration-300"
            style={{ boxShadow: `0 0 20px ${s.color}10` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="text-4xl mb-4 animate-pulse">📋</div>
          <p className="text-gray-500 text-sm">Loading pipeline...</p>
        </div>
      ) : viewMode === 'pipeline' ? (
        /* Pipeline / Kanban View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map(stage => {
            const config = STATUS_CONFIG[stage]
            const stageLeads = leads.filter(l => l.status === stage)
            return (
              <div key={stage} className="space-y-3">
                {/* Column Header */}
                <div
                  className="rounded-lg px-3 py-2 flex items-center justify-between"
                  style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                >
                  <span className="text-xs font-semibold" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: config.bg, color: config.color }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Lead Cards */}
                <div className="space-y-2 min-h-[120px]">
                  {stageLeads.map(lead => {
                    const days = daysSince(lead.lastContactDate)
                    return (
                      <div
                        key={lead.id}
                        className="glass rounded-lg p-3 hover-glow-subtle transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium text-white truncate flex-1">{lead.name}</div>
                          <span className="text-xs ml-1">{SOURCE_ICONS[lead.source]}</span>
                        </div>
                        <div className="text-xs text-cyan-400 font-mono mb-2">
                          {formatCurrency(lead.estimatedValue)}
                        </div>
                        {days !== null && (
                          <div className={`text-[10px] ${days > 7 ? 'text-red-400' : 'text-gray-500'}`}>
                            {days === 0 ? 'Today' : `${days}d ago`}
                          </div>
                        )}

                        {/* Quick status change buttons */}
                        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {PIPELINE_STAGES.filter(s => s !== stage).slice(0, 2).map(nextStage => (
                            <button
                              key={nextStage}
                              onClick={() => updateLeadStatus(lead.id, nextStage)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.12] transition-colors"
                              title={`Move to ${STATUS_CONFIG[nextStage].label}`}
                            >
                              → {STATUS_CONFIG[nextStage].label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Analytics View */
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <div
            className="glass rounded-xl p-6"
            style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.3)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {funnelData.map((stage, i) => {
                const maxCount = Math.max(...funnelData.map(s => s.count), 1)
                const pct = (stage.count / maxCount) * 100
                const prevCount = i > 0 ? funnelData[i - 1].count : 0
                const conversionRate = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : null
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: stage.color }}>{stage.label}</span>
                      <div className="flex items-center gap-3">
                        {conversionRate !== null && (
                          <span className="text-gray-600 font-mono">{conversionRate}%</span>
                        )}
                        <span className="text-white font-medium font-mono w-6 text-right">{stage.count}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: stage.color,
                          boxShadow: `0 0 12px ${stage.color}60`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Source Breakdown & Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Breakdown */}
            <div
              className="glass rounded-xl p-6"
              style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">Leads by Source</h3>
              <div className="space-y-3">
                {Object.entries(sourceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <span className="text-lg w-7">{SOURCE_ICONS[source as LeadSource] ?? '📌'}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-300 capitalize">{source.replace('_', ' ')}</span>
                            <span className="text-white font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Revenue by Status */}
            <div
              className="glass rounded-xl p-6"
              style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(99, 216, 102, 0.1)', border: '1px solid rgba(99, 216, 102, 0.2)' }}>
                  <span className="text-sm text-emerald-400">Closed Revenue</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                  <span className="text-sm text-cyan-400">Pipeline Value</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">{formatCurrency(pipelineValue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <span className="text-sm text-purple-400">Total Potential</span>
                  <span className="text-lg font-bold text-purple-400 font-mono">{formatCurrency(totalRevenue + pipelineValue)}</span>
                </div>

                {/* Per-deal breakdown */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <div className="text-xs text-gray-500 mb-2">Recent Closed Deals</div>
                  {leads
                    .filter(l => l.status === 'closed_won')
                    .sort((a, b) => new Date(b.closedAt ?? b.updatedAt).getTime() - new Date(a.closedAt ?? a.updatedAt).getTime())
                    .slice(0, 3)
                    .map(lead => (
                      <div key={lead.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-300">{lead.name}</span>
                        <span className="text-sm text-emerald-400 font-mono">{formatCurrency(lead.actualRevenue)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div
            className="relative w-full max-w-lg glass-strong rounded-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 60px rgba(0, 217, 255, 0.15), 0 0 120px rgba(168, 85, 247, 0.08)' }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Add New Lead</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Lead name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Source</label>
                  <select
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value as LeadSource }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="twitter">Twitter/X</option>
                    <option value="upwork">Upwork</option>
                    <option value="discord">Discord</option>
                    <option value="reddit">Reddit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Setup Type</label>
                  <select
                    value={form.setupType}
                    onChange={e => setForm(f => ({ ...f, setupType: e.target.value as LeadFormData['setupType'] }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="basic">Basic</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Est. Value ($)</label>
                  <input
                    type="number"
                    value={form.estimatedValue || ''}
                    onChange={e => setForm(f => ({ ...f, estimatedValue: Number(e.target.value) || 0 }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Next Follow-up</label>
                <input
                  type="date"
                  value={form.nextFollowUpDate}
                  onChange={e => setForm(f => ({ ...f, nextFollowUpDate: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none"
                  placeholder="Additional notes..."
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
                disabled={saving || !form.name.trim()}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                }}
              >
                {saving ? 'Saving...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
