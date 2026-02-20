'use client'

import { useState } from 'react'

interface Agent {
  id: string
  name: string
  color: string
  status: 'active' | 'idle' | 'offline'
  lastActiveAt: string | null
  lastMessage: string | null
  sessionFile: string | null
}

interface OfficeViewProps {
  agents: Agent[]
}

const AGENT_AVATARS: Record<string, string> = {
  jarvis: '👨‍💼',
  codebot: '🤖',
  reviewbot: '🔍',
  bizbot: '💼',
}

const DESK_POSITIONS = {
  jarvis: { x: 15, y: 15 },    // Top-left
  codebot: { x: 65, y: 15 },   // Top-right
  reviewbot: { x: 15, y: 70 }, // Bottom-left
  bizbot: { x: 65, y: 70 },    // Bottom-right
}

const COMMON_AREA = { x: 40, y: 42.5 }

export default function OfficeView({ agents }: OfficeViewProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden glass-strong"
      style={{
        aspectRatio: '16/10',
        maxHeight: '85vh',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 80px rgba(0, 217, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Office Layout */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900/50 via-gray-800/30 to-purple-900/20">
        
        {/* Ambient glow overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 217, 255, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="office-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-400"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#office-grid)" />
        </svg>

        {/* Common Area (Center) - Break Room */}
        <div 
          className="absolute flex items-center justify-center"
          style={{
            left: `${COMMON_AREA.x}%`,
            top: `${COMMON_AREA.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 'min(25%, 280px)',
            aspectRatio: '1',
          }}
        >
          <div 
            className="relative w-full h-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden"
            style={{
              borderColor: 'rgba(251, 191, 36, 0.3)',
              background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.03) 100%)',
            }}
          >
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-20 blur-xl"
              style={{
                background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
              }}
            />
            
            <span className="text-xs text-amber-500/60 font-bold tracking-wide z-10">BREAK ROOM</span>
            
            {/* Idle agents gather here */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
              {agents
                .filter(a => a.status === 'idle')
                .map((agent, idx) => (
                  <div
                    key={agent.id}
                    className="transition-all duration-700 ease-in-out animate-float cursor-pointer hover:scale-125"
                    style={{
                      animationDelay: `${idx * 0.3}s`,
                    }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div 
                      className="text-4xl filter drop-shadow-lg"
                      title={`${agent.name} - ${agent.status}`}
                      style={{
                        filter: `drop-shadow(0 0 12px ${agent.color}80)`,
                      }}
                    >
                      {AGENT_AVATARS[agent.id]}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Agent Desks */}
        {agents.map(agent => {
          const pos = DESK_POSITIONS[agent.id as keyof typeof DESK_POSITIONS]
          const isActive = agent.status === 'active'
          const isIdle = agent.status === 'idle'
          const isOffline = agent.status === 'offline'
          const isHovered = hoveredAgent === agent.id

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
                width: 'min(20%, 200px)',
                zIndex: isHovered ? 20 : 10,
              }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              onClick={() => setSelectedAgent(agent.id)}
            >
              {/* Desk glow when active */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-30 blur-2xl animate-pulse"
                  style={{
                    background: `radial-gradient(ellipse at center, ${agent.color} 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Desk */}
              <div 
                className="relative rounded-xl p-4 cursor-pointer transition-all duration-300 glass"
                style={{
                  border: `2px solid ${isActive ? agent.color : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: isActive 
                    ? `0 0 30px ${agent.color}60, 0 0 60px ${agent.color}30, inset 0 0 20px ${agent.color}10` 
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  background: isActive 
                    ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`
                    : 'rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Desk label */}
                <div className="text-center mb-3">
                  <div 
                    className="text-sm font-bold tracking-wide transition-all duration-300"
                    style={{ 
                      color: agent.color,
                      textShadow: isActive ? `0 0 12px ${agent.color}` : 'none',
                    }}
                  >
                    {agent.name.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono font-semibold mt-0.5">
                    {agent.status.toUpperCase()}
                  </div>
                </div>

                {/* Computer monitor */}
                <div 
                  className="relative mx-auto w-20 h-12 rounded-md mb-3 transition-all duration-500"
                  style={{
                    backgroundColor: '#0A0A0A',
                    border: '3px solid #1A1A1A',
                    boxShadow: isActive 
                      ? `0 0 24px ${agent.color}, inset 0 0 24px ${agent.color}60` 
                      : 'inset 0 2px 8px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* Screen content when active */}
                  {isActive && (
                    <>
                      <div 
                        className="absolute inset-1 rounded-sm animate-pulse"
                        style={{
                          background: `linear-gradient(135deg, ${agent.color}40 0%, ${agent.color}20 100%)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-1 h-1 rounded-full animate-pulse"
                          style={{ backgroundColor: agent.color }}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Monitor stand */}
                  <div 
                    className="absolute -bottom-3 left-1/2 w-8 h-3 rounded-b-md"
                    style={{
                      backgroundColor: '#1A1A1A',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>

                {/* Character */}
                <div className="relative h-14 flex items-end justify-center">
                  {!isIdle && (
                    <div
                      className={`text-5xl transition-all duration-700 ${
                        isActive ? 'animate-typing' : ''
                      }`}
                      style={{
                        opacity: isOffline ? 0.15 : 1,
                        filter: isOffline 
                          ? 'grayscale(100%)' 
                          : isActive 
                          ? `drop-shadow(0 0 8px ${agent.color})` 
                          : 'none',
                      }}
                    >
                      {AGENT_AVATARS[agent.id]}
                    </div>
                  )}
                  
                  {/* Empty chair when idle */}
                  {isIdle && (
                    <div className="text-3xl opacity-20">🪑</div>
                  )}
                </div>

                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${isActive ? 'status-active' : ''}`}
                    style={{
                      backgroundColor: isActive ? agent.color : isIdle ? '#F59E0B' : '#4B5563',
                      boxShadow: isActive ? `0 0 12px ${agent.color}` : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Tooltip on hover */}
              {isHovered && agent.lastMessage && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 mt-3 p-3 rounded-xl text-xs leading-relaxed max-w-xs z-50 whitespace-normal animate-fadeIn"
                  style={{
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${agent.color}`,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 24px ${agent.color}40`,
                  }}
                >
                  <div className="text-gray-300 line-clamp-3 text-[11px]">
                    &ldquo;{agent.lastMessage}&rdquo;
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Legend */}
        <div 
          className="absolute bottom-6 left-6 glass rounded-lg px-4 py-3 flex gap-4 text-[11px]"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 status-active" />
            <span className="text-gray-400 font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-400 font-medium">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <span className="text-gray-400 font-medium">Offline</span>
          </div>
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-50 animate-fadeIn"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="glass-strong rounded-2xl p-8 max-w-md w-full mx-4 animate-slideIn"
            style={{ 
              border: `2px solid ${agents.find(a => a.id === selectedAgent)?.color}`,
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px ${agents.find(a => a.id === selectedAgent)?.color}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const agent = agents.find(a => a.id === selectedAgent)
              if (!agent) return null
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span 
                        className="text-5xl"
                        style={{
                          filter: `drop-shadow(0 0 12px ${agent.color})`,
                        }}
                      >
                        {AGENT_AVATARS[agent.id]}
                      </span>
                      <div>
                        <h3 
                          className="text-xl font-bold"
                          style={{ 
                            color: agent.color,
                            textShadow: `0 0 20px ${agent.color}60`,
                          }}
                        >
                          {agent.name}
                        </h3>
                        <p 
                          className="text-xs font-mono font-semibold mt-1"
                          style={{ color: agent.color }}
                        >
                          {agent.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="text-gray-400 hover:text-white transition-all duration-300 text-2xl hover:scale-110"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div 
                      className="glass-dark rounded-lg p-4"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <div className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Last Activity</div>
                      <div className="text-gray-200 font-mono">
                        {agent.lastActiveAt 
                          ? new Date(agent.lastActiveAt).toLocaleString()
                          : 'Never'}
                      </div>
                    </div>

                    <div 
                      className="glass-dark rounded-lg p-4"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <div className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Session File</div>
                      <div className="text-gray-200 font-mono text-xs break-all">
                        {agent.sessionFile || '—'}
                      </div>
                    </div>

                    {agent.lastMessage && (
                      <div 
                        className="glass-dark rounded-lg p-4"
                        style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                      >
                        <div className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Last Message</div>
                        <div className="text-gray-300 text-xs leading-relaxed">
                          &ldquo;{agent.lastMessage}&rdquo;
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
