'use client'

import { useEffect, useState } from 'react'

interface DiskInfo {
  total: string
  used: string
  available: string
  usePercent: string
}

interface MemoryInfo {
  freeGB: string
  usedGB: string
  totalGB: string
  usedPercent: number
}

interface HealthData {
  disk: DiskInfo | null
  memory: MemoryInfo | null
  uptime: string | null
  services: {
    gateway: boolean
    ollama: boolean
  }
  updatedAt: string
}

function ServiceChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium"
      style={{
        backgroundColor: ok ? '#0d2018' : '#1a0d0d',
        borderColor: ok ? '#1a4a2a' : '#4a1a1a',
        color: ok ? '#63D866' : '#ef4444',
      }}
    >
      <span>{ok ? '✅' : '❌'}</span>
      <span className="uppercase tracking-wide">{label}</span>
    </div>
  )
}

function StatChip({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px]"
      style={{
        backgroundColor: '#0d1320',
        borderColor: '#1F2937',
      }}
    >
      <span
        className="font-bold tabular-nums"
        style={{ color: warning ? '#f59e0b' : '#9ca3af' }}
      >
        {value}
      </span>
      <span className="text-gray-600 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export default function SystemHealth() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          const data = await res.json()
          setHealth(data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
        style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
      >
        <span className="text-[10px] text-gray-600 animate-pulse">Loading system health…</span>
      </div>
    )
  }

  if (!health) return null

  const diskPct = health.disk
    ? parseInt(health.disk.usePercent.replace('%', ''))
    : 0
  const diskWarning = diskPct > 80

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-xl border"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      {/* Label */}
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mr-1">
        System
      </span>

      {/* Disk */}
      {health.disk && (
        <StatChip
          label="Disk"
          value={`${health.disk.used}/${health.disk.total} (${health.disk.usePercent})`}
          warning={diskWarning}
        />
      )}

      {/* Memory */}
      {health.memory && (
        <StatChip
          label="RAM"
          value={`${health.memory.usedGB}/${health.memory.totalGB}GB (${health.memory.usedPercent}%)`}
          warning={health.memory.usedPercent > 85}
        />
      )}

      {/* Uptime */}
      {health.uptime && (
        <StatChip label="Uptime" value={health.uptime} />
      )}

      {/* Services */}
      <div className="flex items-center gap-1.5 ml-1">
        <ServiceChip label="Gateway" ok={health.services.gateway} />
        <ServiceChip label="Ollama" ok={health.services.ollama} />
      </div>
    </div>
  )
}
