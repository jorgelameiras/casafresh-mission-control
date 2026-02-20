'use client'

interface ActivityEntry {
  id: string
  agentId: string
  agentName: string
  agentColor: string
  role: string
  content: string
  timestamp: string
  model?: string
}

interface ActivityFeedProps {
  activity: ActivityEntry[]
  loading: boolean
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export default function ActivityFeed({ activity, loading }: ActivityFeedProps) {
  return (
    <div
      className="flex flex-col h-full rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Live Activity
        </h2>
        {loading && (
          <span className="text-[10px] text-gray-600 animate-pulse">updating…</span>
        )}
        {!loading && (
          <span className="text-[10px] text-gray-700">{activity.length} entries</span>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {/* Only show empty state once we have finished the initial load */}
        {activity.length === 0 && !loading && (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-gray-600">No recent activity</span>
          </div>
        )}

        {/* Skeleton rows during first load */}
        {activity.length === 0 && loading && (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-gray-600 animate-pulse">Loading…</span>
          </div>
        )}

        <div className="divide-y divide-gray-800/50">
          {activity.map((entry) => (
            <div
              key={entry.id}
              className="feed-entry px-4 py-2.5 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start gap-2">
                {/* Agent badge */}
                <div className="flex-shrink-0 mt-0.5">
                  <span
                    className="inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{
                      color: entry.agentColor,
                      backgroundColor: `${entry.agentColor}18`,
                      border: `1px solid ${entry.agentColor}40`,
                    }}
                  >
                    {entry.agentId === 'jarvis' ? 'JAR' : entry.agentId.slice(0, 3).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 leading-relaxed break-words">
                    {truncate(entry.content.replace(/\n+/g, ' '), 180)}
                  </p>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-[10px] text-gray-600 font-mono mt-0.5">
                  {timeAgo(entry.timestamp)}
                </div>
              </div>

              {/* Role indicator (user messages styled differently) */}
              {entry.role === 'user' && (
                <div className="mt-1 ml-8">
                  <span className="text-[9px] text-gray-700 uppercase tracking-wide">prompt</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
