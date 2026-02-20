'use client'

interface Agent {
  id: string
  name: string
  color: string
  status: 'active' | 'idle' | 'offline'
  lastActiveAt: string | null
  lastMessage: string | null
  sessionFile: string | null
}

interface AgentCardProps {
  agent: Agent
}

const STATUS_LABELS = {
  active: 'ACTIVE',
  idle: 'IDLE',
  offline: 'OFFLINE',
}

const STATUS_COLORS = {
  active: '#63D866',
  idle: '#F59E0B',
  offline: '#6B7280',
}

function timeAgo(isoString: string | null): string {
  if (!isoString) return 'never'
  const diff = Date.now() - new Date(isoString).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

export default function AgentCard({ agent }: AgentCardProps) {
  const statusColor = STATUS_COLORS[agent.status]
  const isActive = agent.status === 'active'

  return (
    <div
      className="flex flex-col gap-2 rounded-xl p-4 border transition-all duration-300"
      style={{
        backgroundColor: '#111827',
        borderColor: agent.status !== 'offline' ? `${agent.color}33` : '#1F2937',
        boxShadow: agent.status === 'active' ? `0 0 20px ${agent.color}22` : 'none',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: agent.color }}
        >
          {agent.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${isActive ? 'status-active' : ''}`}
            style={{ backgroundColor: statusColor }}
          />
          <span
            className="text-[10px] font-mono tracking-widest"
            style={{ color: statusColor }}
          >
            {STATUS_LABELS[agent.status]}
          </span>
        </div>
      </div>

      {/* Last message preview */}
      <div className="flex-1 min-h-[48px]">
        {agent.lastMessage ? (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
            &ldquo;{agent.lastMessage.replace(/\n+/g, ' ')}&rdquo;
          </p>
        ) : (
          <p className="text-xs text-gray-600 italic">No recent activity</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <span className="text-[10px] text-gray-600 font-mono">
          {agent.sessionFile
            ? agent.sessionFile.slice(0, 8) + '…'
            : '—'}
        </span>
        <span className="text-[10px] text-gray-500">
          {timeAgo(agent.lastActiveAt)}
        </span>
      </div>
    </div>
  )
}
