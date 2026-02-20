'use client'

import { useEffect, useState } from 'react'

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

interface AgentTimelineProps {
  activity: ActivityEntry[]
}

interface TimelineBlock {
  hour: number
  agents: {
    [agentId: string]: {
      name: string
      color: string
      count: number
    }
  }
}

export default function AgentTimeline({ activity }: AgentTimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineBlock[]>([])

  useEffect(() => {
    // Group activity by hour
    const now = new Date()
    const last24Hours: TimelineBlock[] = []

    // Initialize last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours()
      last24Hours.push({ hour, agents: {} })
    }

    // Process activity
    activity.forEach(entry => {
      const entryTime = new Date(entry.timestamp)
      const hoursDiff = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60 * 60))
      
      if (hoursDiff >= 0 && hoursDiff < 24) {
        const blockIndex = 23 - hoursDiff
        const block = last24Hours[blockIndex]
        
        if (!block.agents[entry.agentId]) {
          block.agents[entry.agentId] = {
            name: entry.agentName,
            color: entry.agentColor,
            count: 0,
          }
        }
        
        block.agents[entry.agentId].count++
      }
    })

    setTimelineData(last24Hours)
  }, [activity])

  const maxCount = Math.max(...timelineData.map(block => 
    Object.values(block.agents).reduce((sum, agent) => sum + agent.count, 0)
  ), 1)

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0D1320', border: '1px solid #1F2937' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1F2937' }}>
        <h2 className="text-sm font-bold text-white tracking-wide">
          📊 24-Hour Activity Timeline
        </h2>
        <p className="text-[10px] text-gray-600 mt-0.5">Agent activity over the last 24 hours</p>
      </div>

      {/* Timeline */}
      <div className="p-4">
        <div className="flex items-end justify-between gap-1 h-48">
          {timelineData.map((block, idx) => {
            const totalCount = Object.values(block.agents).reduce((sum, agent) => sum + agent.count, 0)
            const height = totalCount > 0 ? (totalCount / maxCount) * 100 : 0
            const agentColors = Object.values(block.agents).map(a => a.color)
            
            return (
              <div
                key={idx}
                className="flex-1 group relative flex flex-col justify-end"
                style={{ minWidth: '4px' }}
              >
                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    minHeight: totalCount > 0 ? '4px' : '0px',
                    background: agentColors.length === 1
                      ? agentColors[0]
                      : `linear-gradient(to top, ${agentColors.join(', ')})`,
                  }}
                />

                {/* Tooltip */}
                {totalCount > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 rounded-lg p-2 shadow-lg border border-gray-700 whitespace-nowrap text-xs">
                      <div className="text-gray-400 mb-1 font-mono">
                        {block.hour.toString().padStart(2, '0')}:00
                      </div>
                      {Object.entries(block.agents).map(([agentId, agent]) => (
                        <div key={agentId} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: agent.color }}
                          />
                          <span className="text-gray-300">
                            {agent.name}: {agent.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* X-axis labels (every 4 hours) */}
        <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono">
          {timelineData
            .filter((_, idx) => idx % 4 === 0)
            .map((block, idx) => (
              <span key={idx}>{block.hour.toString().padStart(2, '0')}:00</span>
            ))}
        </div>
      </div>
    </div>
  )
}
