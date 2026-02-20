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

interface WorkloadChartProps {
  activity: ActivityEntry[]
}

interface AgentWorkload {
  id: string
  name: string
  color: string
  count: number
  percentage: number
}

export default function WorkloadChart({ activity }: WorkloadChartProps) {
  const [workloadData, setWorkloadData] = useState<AgentWorkload[]>([])

  useEffect(() => {
    // Count messages per agent (only assistant messages)
    const agentCounts: { [agentId: string]: { name: string; color: string; count: number } } = {}

    activity
      .filter(entry => entry.role === 'assistant')
      .forEach(entry => {
        if (!agentCounts[entry.agentId]) {
          agentCounts[entry.agentId] = {
            name: entry.agentName,
            color: entry.agentColor,
            count: 0,
          }
        }
        agentCounts[entry.agentId].count++
      })

    const total = Object.values(agentCounts).reduce((sum, agent) => sum + agent.count, 0)

    const workload: AgentWorkload[] = Object.entries(agentCounts)
      .map(([id, data]) => ({
        id,
        name: data.name,
        color: data.color,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    setWorkloadData(workload)
  }, [activity])

  const maxCount = Math.max(...workloadData.map(a => a.count), 1)

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#0D1320', border: '1px solid #1F2937' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1F2937' }}>
        <h2 className="text-sm font-bold text-white tracking-wide">
          💪 Agent Workload
        </h2>
        <p className="text-[10px] text-gray-600 mt-0.5">Tasks completed by each agent</p>
      </div>

      {/* Chart */}
      <div className="p-4 space-y-3">
        {workloadData.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            No activity data available
          </div>
        ) : (
          workloadData.map(agent => (
            <div key={agent.id} className="group">
              {/* Agent info */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-xs font-medium text-gray-300">
                    {agent.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">
                    {agent.count} tasks
                  </span>
                  <span className="text-xs text-gray-600 font-mono">
                    {agent.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="relative w-full h-6 bg-gray-900 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2"
                  style={{
                    width: `${(agent.count / maxCount) * 100}%`,
                    backgroundColor: agent.color,
                    opacity: 0.8,
                  }}
                >
                  {agent.count > 0 && (
                    <span className="text-[10px] font-bold text-white drop-shadow">
                      {agent.count}
                    </span>
                  )}
                </div>

                {/* Hover effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: agent.color }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {workloadData.length > 0 && (
        <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#1F2937' }}>
          <span className="text-[10px] text-gray-600">Total Tasks</span>
          <span className="text-xs font-mono text-gray-400">
            {workloadData.reduce((sum, a) => sum + a.count, 0)}
          </span>
        </div>
      )}
    </div>
  )
}
