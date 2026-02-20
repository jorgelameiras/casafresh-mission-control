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

interface TaskHistoryProps {
  activity: ActivityEntry[]
}

// Extract "task-like" entries from activity — long assistant messages that look like completed work
function inferTasks(activity: ActivityEntry[]) {
  return activity
    .filter(e => e.role === 'assistant' && e.content.length > 60)
    .slice(0, 15)
    .map(e => ({
      id: e.id,
      agentId: e.agentId,
      agentName: e.agentName,
      agentColor: e.agentColor,
      summary: summarize(e.content),
      timestamp: e.timestamp,
      model: e.model,
    }))
}

function summarize(text: string): string {
  // Take first sentence or 120 chars
  const cleaned = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
  const firstSentence = cleaned.match(/^[^.!?]+[.!?]/)?.[0]
  if (firstSentence && firstSentence.length <= 140) return firstSentence
  return cleaned.slice(0, 120).trimEnd() + '…'
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function TaskHistory({ activity }: TaskHistoryProps) {
  const tasks = inferTasks(activity)

  return (
    <div
      className="flex flex-col h-full rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Task History
        </h2>
        <span className="text-[10px] text-gray-700">{tasks.length} recent</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-gray-600">No tasks recorded</span>
          </div>
        )}

        <div className="divide-y divide-gray-800/50">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="px-4 py-3 hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                {/* Agent tag */}
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: task.agentColor }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: task.agentColor }}
                  >
                    {task.agentName}
                  </span>
                </div>

                {/* Time */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-mono text-gray-500">{formatTime(task.timestamp)}</div>
                  <div className="text-[9px] text-gray-700">{timeAgo(task.timestamp)}</div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-gray-400 leading-relaxed pl-3.5">
                {task.summary}
              </p>

              {/* Model badge */}
              {task.model && (
                <div className="mt-1.5 pl-3.5">
                  <span className="text-[9px] text-gray-700 font-mono bg-gray-900 px-1.5 py-0.5 rounded">
                    {task.model}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
