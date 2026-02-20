'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

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

interface GlobalSearchProps {
  activity: ActivityEntry[]
  onViewChange: (view: string) => void
  onClose: () => void
}

interface SearchResult {
  id: string
  icon: string
  title: string
  subtitle: string
  view: string
  color?: string
}

const NAV_RESULTS: SearchResult[] = [
  { id: 'nav-office', icon: '🏢', title: 'Office', subtitle: 'Agent overview and status', view: 'office' },
  { id: 'nav-analytics', icon: '📊', title: 'Analytics', subtitle: 'Performance metrics and charts', view: 'analytics' },
  { id: 'nav-activity', icon: '📝', title: 'Activity Log', subtitle: 'Real-time agent communications', view: 'activity' },
  { id: 'nav-memory', icon: '💾', title: 'Memory', subtitle: 'Business context and agent memory', view: 'memory' },
  { id: 'nav-calendar', icon: '📅', title: 'Calendar', subtitle: 'Scheduling and job tracking', view: 'calendar' },
  { id: 'nav-articles', icon: '📄', title: 'Articles', subtitle: 'X/Twitter content tracker', view: 'articles' },
  { id: 'nav-videos', icon: '🎥', title: 'Videos', subtitle: 'Video content tracker', view: 'videos' },
  { id: 'nav-settings', icon: '⚙️', title: 'Settings', subtitle: 'Dashboard preferences', view: 'settings' },
]

const RECENT_SEARCHES_KEY = 'casafresh-recent-searches'

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ts
  }
}

export default function GlobalSearch({ activity, onViewChange, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch {}
  }, [])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const q = query.toLowerCase()

    // Match nav items
    const navMatches = NAV_RESULTS.filter(
      r => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
    )

    // Match activity entries
    const activityMatches: SearchResult[] = activity
      .filter(a =>
        a.content.toLowerCase().includes(q) ||
        a.agentName.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map(a => ({
        id: `activity-${a.id}`,
        icon: '💬',
        title: a.content.length > 70 ? a.content.slice(0, 70) + '…' : a.content,
        subtitle: `${a.agentName} · ${formatTimestamp(a.timestamp)}`,
        view: 'activity',
        color: a.agentColor,
      }))

    setResults([...navMatches, ...activityMatches])
    setSelectedIndex(0)
  }, [query, activity])

  const saveSearch = useCallback((q: string) => {
    if (!q.trim()) return
    setRecentSearches(prev => {
      const updated = [q, ...prev.filter(s => s !== q)].slice(0, 5)
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const handleSelect = useCallback((result: SearchResult) => {
    saveSearch(query)
    onViewChange(result.view)
    onClose()
  }, [query, onViewChange, onClose, saveSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    }
  }

  const handleRecentSearch = (s: string) => {
    setQuery(s)
    inputRef.current?.focus()
  }

  const showRecent = !query.trim() && recentSearches.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(10, 15, 26, 0.99) 100%)',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          boxShadow: '0 0 60px rgba(0, 217, 255, 0.2), 0 24px 80px rgba(0, 0, 0, 0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <span className="text-xl">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search views, activity, agents…"
            className="flex-1 bg-transparent text-white text-lg placeholder-gray-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-500 hover:text-white transition-colors text-sm px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xs px-2 py-1 rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {/* Recent Searches */}
          {showRecent && (
            <div className="p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => handleRecentSearch(s)}
                    className="px-3 py-1.5 rounded-full text-sm text-gray-300 hover:text-white transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!showRecent && query.trim() && results.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-3xl mb-3">🔎</div>
              <p className="text-gray-400 font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-gray-600 text-sm mt-1">Try searching for an agent name, view, or activity content</p>
            </div>
          )}

          {/* Default hint */}
          {!showRecent && !query.trim() && (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-sm">Start typing to search views and activity…</p>
              <p className="text-gray-700 text-xs mt-2">Tip: Use arrow keys to navigate, Enter to select</p>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-4 px-5 py-3 transition-all text-left"
                  style={{
                    background: idx === selectedIndex
                      ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)'
                      : 'transparent',
                    borderLeft: idx === selectedIndex ? '2px solid #00D9FF' : '2px solid transparent',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="text-xl flex-shrink-0">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${idx === selectedIndex ? 'text-white' : 'text-gray-300'}`}>
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{result.subtitle}</p>
                  </div>
                  {idx === selectedIndex && (
                    <span className="text-xs text-cyan-400 flex-shrink-0">↵ Open</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-xs text-gray-600">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
          <span className="ml-auto">⌘K to open anywhere</span>
        </div>
      </div>
    </div>
  )
}
