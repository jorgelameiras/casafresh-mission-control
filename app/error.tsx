'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0A0F1A' }}>
      <div
        className="glass-strong rounded-xl p-10 max-w-md w-full text-center"
        style={{ boxShadow: '0 0 40px rgba(232, 88, 88, 0.15)' }}
      >
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
