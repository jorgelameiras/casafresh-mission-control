'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, backgroundColor: '#0A0F1A', color: '#E5E7EB', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              padding: 40,
              maxWidth: 420,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(232, 88, 88, 0.15)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Critical Error
            </h2>
            <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
              {error.message || 'A critical error occurred. Please try refreshing.'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
