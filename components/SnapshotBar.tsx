'use client'

interface Snapshot {
  leads: number
  properties: number
  ideas: number
  memoryFiles: number
  lastLogEntry: string | null
  updatedAt: string
}

interface SnapshotBarProps {
  snapshot: Snapshot | null
}

interface StatPillProps {
  label: string
  value: number | string
  accent?: boolean
}

const MAX_LOG_ENTRY_LENGTH = 60

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-800 bg-[#0D1320]">
      <span
        className="text-lg font-bold tabular-nums"
        style={{ color: accent ? '#63D866' : '#E5E7EB' }}
      >
        {value}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        {label}
      </span>
    </div>
  )
}

export default function SnapshotBar({ snapshot }: SnapshotBarProps) {
  if (!snapshot) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-[#111827]">
        <span className="text-xs text-gray-600 animate-pulse">Loading snapshot…</span>
      </div>
    )
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-xl border"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      <div className="flex items-center gap-1 mr-2">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
          Business Snapshot
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatPill label="Leads" value={snapshot.leads} accent />
        <StatPill label="Properties" value={snapshot.properties} />
        <StatPill label="Ideas" value={snapshot.ideas} />
        <StatPill label="Memory Files" value={snapshot.memoryFiles} />
      </div>

      {snapshot.lastLogEntry && (
        <div className="ml-auto flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-gray-600 flex-shrink-0">Last log:</span>
          <span
            className="text-[10px] text-gray-400 font-mono truncate"
            title={snapshot.lastLogEntry}
          >
            {truncate(snapshot.lastLogEntry, MAX_LOG_ENTRY_LENGTH)}
          </span>
        </div>
      )}
    </div>
  )
}
