'use client'

import { useEffect, useState } from 'react'

interface TodayMemory {
  date: string
  content: string | null
  exists: boolean
}

interface LongTermMemory {
  content: string | null
  exists: boolean
}

interface MemoryData {
  today: TodayMemory
  longTerm: LongTermMemory
  overnightLog: {
    mtime: number | null
    mtimeIso: string | null
  }
  updatedAt: string
}

export default function MemoryViewer() {
  const [data, setData] = useState<MemoryData | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    async function fetchMemory() {
      setLoading(true)
      try {
        const res = await fetch('/api/memory')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchMemory()
  }, [open])

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#111827', borderColor: '#1F2937' }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🧠</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Memory Viewer
          </span>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-[10px] text-gray-600">
              {data.today.date}
            </span>
          )}
          <span
            className="text-gray-600 text-xs transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-gray-800">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <span className="text-xs text-gray-600 animate-pulse">Loading memory…</span>
            </div>
          )}

          {!loading && data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
              {/* Today's memory */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    📅 Today — {data.today.date}
                  </span>
                </div>
                <div
                  className="rounded-lg border p-3 overflow-y-auto"
                  style={{
                    maxHeight: '280px',
                    backgroundColor: '#0d1320',
                    borderColor: '#1F2937',
                  }}
                >
                  {data.today.exists && data.today.content ? (
                    <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {data.today.content}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-600 italic">
                      No memory file for today yet
                    </p>
                  )}
                </div>
              </div>

              {/* Long-term memory excerpt */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    🔮 Long-Term Memory (last 500 chars)
                  </span>
                </div>
                <div
                  className="rounded-lg border p-3 overflow-y-auto"
                  style={{
                    maxHeight: '280px',
                    backgroundColor: '#0d1320',
                    borderColor: '#1F2937',
                  }}
                >
                  {data.longTerm.exists && data.longTerm.content ? (
                    <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {data.longTerm.content}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-600 italic">
                      No MEMORY.md found
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
