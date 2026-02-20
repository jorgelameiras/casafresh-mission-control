'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  color: string
  status: 'active' | 'idle' | 'offline'
}

interface NavItem {
  icon: string
  label: string
  path: string
  id: string
}

interface SidebarProps {
  agents: Agent[]
  currentView: string
  onViewChange: (view: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSearchOpen: () => void
}

const NAV_ITEMS: NavItem[] = [
  { icon: '🏢', label: 'Office', path: '/', id: 'office' },
  { icon: '📊', label: 'Analytics', path: '/analytics', id: 'analytics' },
  { icon: '📝', label: 'Activity', path: '/activity', id: 'activity' },
  { icon: '💾', label: 'Memory', path: '/memory', id: 'memory' },
  { icon: '📅', label: 'Calendar', path: '/calendar', id: 'calendar' },
  { icon: '📄', label: 'Articles', path: '/articles', id: 'articles' },
  { icon: '🎥', label: 'Videos', path: '/videos', id: 'videos' },
  { icon: '⚙️', label: 'Settings', path: '/settings', id: 'settings' },
]

export default function Sidebar({ 
  agents, 
  currentView, 
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  onSearchOpen,
}: SidebarProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-[280px]'}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 15, 26, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5), inset -1px 0 0 rgba(0, 217, 255, 0.1)',
        }}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo / Brand */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div 
                className="text-2xl transition-transform duration-300 hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.5))',
                }}
              >
                🏠
              </div>
              {!isCollapsed && (
                <div className="flex-1 animate-slideIn">
                  <h1 className="text-sm font-bold tracking-wide text-white">
                    CasaFresh
                  </h1>
                  <p className="text-[10px] text-cyan-400/60 font-medium">
                    Mission Control
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={onSearchOpen}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group hover:scale-[1.02]"
              style={{
                background: 'rgba(0, 217, 255, 0.06)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                boxShadow: '0 0 12px rgba(0, 217, 255, 0.05)',
              }}
            >
              <span className="text-base">🔍</span>
              {!isCollapsed && (
                <>
                  <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors flex-1 text-left">
                    Search…
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono text-gray-600"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    ⌘K
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-300 ease-out group
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 shadow-lg' 
                      : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                    }
                  `}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isActive 
                      ? '0 0 20px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1)' 
                      : 'none',
                  }}
                >
                  <span 
                    className={`
                      text-xl transition-transform duration-300
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `}
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 4px rgba(0, 217, 255, 0.8))' : 'none',
                    }}
                  >
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <span 
                      className={`
                        text-sm font-medium transition-all duration-300
                        ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'}
                      `}
                    >
                      {item.label}
                    </span>
                  )}
                  
                  {isActive && !isCollapsed && (
                    <div className="ml-auto">
                      <div 
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        style={{
                          boxShadow: '0 0 8px rgba(0, 217, 255, 0.8)',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Agent Status */}
          <div className="p-4 border-t border-white/10">
            {!isCollapsed && (
              <div className="mb-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Agents
                </p>
              </div>
            )}
            
            <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} items-center gap-2`}>
              {agents.map(agent => {
                const isActive = agent.status === 'active'
                const isIdle = agent.status === 'idle'
                
                return (
                  <div
                    key={agent.id}
                    className="relative group cursor-pointer"
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <div
                      className={`
                        w-3 h-3 rounded-full transition-all duration-300
                        ${isActive ? 'animate-pulse' : ''}
                      `}
                      style={{
                        backgroundColor: agent.color,
                        boxShadow: isActive 
                          ? `0 0 12px ${agent.color}, 0 0 24px ${agent.color}80` 
                          : isIdle
                          ? `0 0 6px ${agent.color}40`
                          : 'none',
                        opacity: agent.status === 'offline' ? 0.3 : 1,
                      }}
                    />
                    
                    {/* Tooltip */}
                    {hoveredAgent === agent.id && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap z-50 animate-slideIn"
                        style={{
                          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
                          backdropFilter: 'blur(12px)',
                          border: `1px solid ${agent.color}`,
                          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.5), 0 0 20px ${agent.color}40`,
                        }}
                      >
                        <div className="text-white font-semibold">{agent.name}</div>
                        <div 
                          className="text-[10px] mt-0.5 font-mono uppercase tracking-wide"
                          style={{ color: agent.color }}
                        >
                          {agent.status}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </aside>

      {/* Collapse Toggle Button (Desktop) */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:block fixed top-6 z-50 transition-all duration-300"
        style={{
          left: isCollapsed ? '1.5rem' : '264px',
        }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="text-sm transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
            ◀
          </span>
        </div>
      </button>
    </>
  )
}
