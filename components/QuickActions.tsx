'use client'

import { useState, useEffect, useCallback } from 'react'

interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
  glow: string
}

const ACTIONS: QuickAction[] = [
  { id: 'market-brief', label: 'Run Market Brief', icon: '📊', color: '#00D9FF', glow: 'rgba(0, 217, 255, 0.4)' },
  { id: 'competitors', label: 'Research Competitors', icon: '🔍', color: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'emails', label: 'Check Emails', icon: '📧', color: '#63D866', glow: 'rgba(99, 216, 102, 0.4)' },
  { id: 'leads', label: 'Scan Leads', icon: '🎯', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
]

interface Toast {
  id: string
  message: string
  color: string
}

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAction = (action: QuickAction) => {
    const toastId = `${action.id}-${Date.now()}`
    const toast: Toast = {
      id: toastId,
      message: `${action.icon} ${action.label} — dispatched`,
      color: action.color,
    }
    setToasts(prev => [...prev, toast])
    setIsOpen(false)

    // Auto-remove after 3s
    setTimeout(() => removeToast(toastId), 3000)
  }

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-slideIn"
            style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${toast.color}40`,
              boxShadow: `0 4px 24px rgba(0, 0, 0, 0.5), 0 0 20px ${toast.color}20`,
              borderRadius: '12px',
              padding: '12px 20px',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: toast.color,
                  boxShadow: `0 0 8px ${toast.color}`,
                  animation: 'livePulse 1s ease-in-out infinite',
                }}
              />
              <span className="text-sm text-gray-200 font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white transition-colors ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Panel */}
      <div className="fixed bottom-8 right-8 z-[90]">
        {/* Expanded Panel */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-3 animate-slideIn">
            <div
              className="rounded-2xl p-2 min-w-[220px]"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97) 0%, rgba(10, 15, 26, 0.99) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 217, 255, 0.08)',
              }}
            >
              <div className="px-3 py-2 mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Quick Actions</span>
              </div>
              {ACTIONS.map((action, idx) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = `${action.color}15`
                    el.style.boxShadow = `0 0 20px ${action.glow}`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'transparent'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                    {action.icon}
                  </span>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                    {action.label}
                  </span>
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: action.color, boxShadow: `0 0 6px ${action.color}` }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #A855F7 0%, #00D9FF 100%)'
              : 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
            boxShadow: `0 4px 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)`,
          }}
        >
          <span
            className="text-white text-2xl transition-transform duration-300 block"
            style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
          >
            ⚡
          </span>
        </button>
      </div>
    </>
  )
}
