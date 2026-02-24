'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Client, ClientStatus, ClientPriority } from '@/lib/types'

const STATUS_COLORS: Record<ClientStatus, string> = {
  lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  prospect: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  active: 'Active',
  inactive: 'Inactive',
}

const PRIORITY_CONFIG: Record<ClientPriority, { class: string; dot: string }> = {
  high: { class: 'bg-red-500/20 text-red-400 border-red-500/30', dot: '🔴' },
  medium: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: '🟡' },
  low: { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: '🟢' },
}

interface FormData {
  name: string
  company: string
  type: 'property_manager' | 'property_owner' | 'hoa'
  email: string
  phone: string
  website: string
  location: string
  status: ClientStatus
  priority: ClientPriority
  notes: string
}

const EMPTY_FORM: FormData = {
  name: '',
  company: '',
  type: 'property_manager',
  email: '',
  phone: '',
  website: '',
  location: '',
  status: 'lead',
  priority: 'medium',
  notes: '',
}

export default function CRMView() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [sortKey, setSortKey] = useState<'company' | 'status' | 'priority' | 'updatedAt'>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients')
      if (res.ok) setClients(await res.json())
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = clients
    .filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.company.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const stats = {
    total: clients.length,
    leads: clients.filter(c => c.status === 'lead').length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    active: clients.filter(c => c.status === 'active').length,
    highPriority: clients.filter(c => c.priority === 'high').length,
  }

  const handleSubmit = async () => {
    if (!form.company.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm(EMPTY_FORM)
        fetchClients()
      }
    } catch (err) {
      console.error('Failed to save client:', err)
    } finally {
      setSaving(false)
    }
  }

  const SortHeader = ({ col, label }: { col: typeof sortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-300 transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === col && (
          <span className="text-cyan-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">👥 CRM</h2>
          <p className="text-sm text-gray-400">Client management — Central Florida vacation rental market</p>
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
          + Add Client
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: stats.total, icon: '👤', color: '#00D9FF' },
          { label: 'Active', value: stats.active, icon: '✅', color: '#63D866' },
          { label: 'Prospects', value: stats.prospects, icon: '🤝', color: '#EAB308' },
          { label: 'Leads', value: stats.leads, icon: '🎯', color: '#3B82F6' },
        ].map(s => (
          <div
            key={s.label}
            className="glass rounded-xl p-5 hover-glow-subtle transition-all duration-300"
            style={{ boxShadow: `0 0 20px ${s.color}10` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              {s.label === 'Total Clients' && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: s.color,
                    boxShadow: `0 0 8px ${s.color}`,
                    animation: 'livePulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search by company, name, location, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
        />
        <div className="flex items-center gap-2">
          {(['all', 'lead', 'prospect', 'active'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterStatus === s
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08] hover:text-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} results</span>
      </div>

      {/* Client Table */}
      <div
        className="glass rounded-xl overflow-hidden"
        style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.3)' }}
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4 animate-pulse">👥</div>
            <p className="text-gray-500 text-sm">Loading clients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <SortHeader col="company" label="Company / Name" />
                  <SortHeader col="status" label="Status" />
                  <SortHeader col="priority" label="Priority" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <SortHeader col="updatedAt" label="Last Updated" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-gray-600">
                      {search || filterStatus !== 'all' ? 'No clients match your filters' : 'No clients yet — add your first one!'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(client => (
                    <tr
                      key={client.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white text-sm">{client.company}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{client.name}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[client.status]}`}>
                          {STATUS_LABELS[client.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_CONFIG[client.priority].class}`}>
                          {PRIORITY_CONFIG[client.priority].dot} {client.priority.charAt(0).toUpperCase() + client.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400">{client.location}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          {client.phone && (
                            <a href={`tel:${client.phone}`} className="block text-xs text-gray-400 hover:text-white transition-colors">
                              {client.phone}
                            </a>
                          )}
                          {client.email && (
                            <a href={`mailto:${client.email}`} className="block text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors truncate max-w-[180px]">
                              {client.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline Summary */}
      <div
        className="glass rounded-xl p-6"
        style={{ boxShadow: '0 4px 40px rgba(0, 0, 0, 0.3)' }}
      >
        <h3 className="text-sm font-semibold text-white mb-4">Pipeline Overview</h3>
        <div className="space-y-3">
          {([
            { label: 'Leads', count: stats.leads, color: 'bg-blue-500', glow: '#3B82F6' },
            { label: 'Prospects', count: stats.prospects, color: 'bg-yellow-500', glow: '#EAB308' },
            { label: 'Active', count: stats.active, color: 'bg-emerald-500', glow: '#63D866' },
          ] as const).map(({ label, count, color, glow }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium font-mono">{count}</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{
                    width: `${clients.length > 0 ? (count / clients.length) * 100 : 0}%`,
                    boxShadow: `0 0 8px ${glow}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Client Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div
            className="relative w-full max-w-lg glass-strong rounded-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 60px rgba(0, 217, 255, 0.15), 0 0 120px rgba(168, 85, 247, 0.08)' }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Add New Client</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Company *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="(407) 555-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="Orlando, FL"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Website</label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as FormData['type'] }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="property_manager">Manager</option>
                    <option value="property_owner">Owner</option>
                    <option value="hoa">HOA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as ClientStatus }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as ClientPriority }))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
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
                disabled={saving || !form.company.trim()}
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                }}
              >
                {saving ? 'Saving...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
