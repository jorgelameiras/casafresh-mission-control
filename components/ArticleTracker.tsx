'use client'

interface Article {
  id: number
  title: string
}

interface ArticleColumn {
  status: 'todo' | 'inProgress' | 'done'
  label: string
  color: string
  glowColor: string
  articles: Article[]
}

const ARTICLES = {
  done: [
    { id: 1, title: 'Small Business AI: 40% Cost Savings Without the Cloud' },
    { id: 2, title: 'The Self-Hosted AI Revolution: Why Decentralization Matters' }
  ],
  inProgress: [
    { id: 3, title: 'Automation Tools That Actually Work: A 2024 Small Business Survival Guide' }
  ],
  todo: [
    { id: 4, title: 'OpenClaw Case Study: Transforming a 500-employee Team' },
    { id: 5, title: 'Hidden Risks of Cloud-Based AI for Small Businesses' }
  ]
}

export default function ArticleTracker() {
  const columns: ArticleColumn[] = [
    {
      status: 'todo',
      label: 'To Do',
      color: '#6B7280',
      glowColor: 'rgba(107, 114, 128, 0.3)',
      articles: ARTICLES.todo
    },
    {
      status: 'inProgress',
      label: 'In Progress',
      color: '#00D9FF',
      glowColor: 'rgba(0, 217, 255, 0.3)',
      articles: ARTICLES.inProgress
    },
    {
      status: 'done',
      label: 'Done',
      color: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      articles: ARTICLES.done
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
            📝 Article Tracker
          </h2>
          <p className="text-gray-400 text-sm">
            Track your X/Twitter article writing progress
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
                  {column.articles.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 overflow-y-auto flex-1">
                {column.articles.map(article => (
                  <div
                    key={article.id}
                    className="group relative p-4 rounded-lg transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.8) 100%)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)'
                      e.currentTarget.style.boxShadow = `0 8px 16px ${column.glowColor}, 0 0 20px ${column.glowColor}`
                      e.currentTarget.style.borderColor = column.color + '60'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {/* Drag Handle (visual only) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                      <span className="text-gray-400 text-xs">⋮⋮</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-white leading-relaxed pr-6">
                      {article.title}
                    </h4>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: column.color,
                          boxShadow: `0 0 8px ${column.glowColor}`,
                        }}
                      />
                      <span 
                        className="text-xs font-medium"
                        style={{ color: column.color }}
                      >
                        {column.label}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {column.articles.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No articles yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
