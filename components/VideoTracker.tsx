'use client'

interface VideoColumn {
  status: 'todo' | 'inProgress' | 'done'
  label: string
  color: string
  glowColor: string
}

export default function VideoTracker() {
  const columns: VideoColumn[] = [
    {
      status: 'todo',
      label: 'To Do',
      color: '#6B7280',
      glowColor: 'rgba(107, 114, 128, 0.3)',
    },
    {
      status: 'inProgress',
      label: 'In Progress',
      color: '#00D9FF',
      glowColor: 'rgba(0, 217, 255, 0.3)',
    },
    {
      status: 'done',
      label: 'Done',
      color: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.3)',
    }
  ]

  return (
    <div className="h-full w-full p-6 animate-fadeIn">
      <div 
        className="glass-strong rounded-2xl p-6 h-full"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.6) 0%, rgba(10, 15, 26, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            🎥 Video Tracker
          </h2>
          <p className="text-gray-400 text-sm">
            Track your video content production pipeline
          </p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
          {columns.map(column => (
            <div key={column.status} className="flex flex-col">
              {/* Column Header */}
              <div 
                className="flex items-center justify-between mb-4 pb-3 border-b"
                style={{ borderColor: column.color + '40' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: column.color,
                      boxShadow: `0 0 12px ${column.glowColor}`,
                    }}
                  />
                  <h3 className="font-semibold text-white">{column.label}</h3>
                </div>
                <span 
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: column.color + '20',
                    color: column.color,
                  }}
                >
                  0
                </span>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8 px-4">
                  <div className="text-4xl mb-3 opacity-20">🎬</div>
                  <p className="text-gray-500 text-sm">
                    No videos yet
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Empty State Message */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="glass-strong rounded-xl p-8 text-center max-w-md"
            style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-white mb-2">
              No videos tracked yet
            </h3>
            <p className="text-gray-400 text-sm">
              Add your first video project to get started!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
