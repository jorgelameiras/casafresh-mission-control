'use client'

import { useState } from 'react'

type GoalStatus = 'not_started' | 'in_progress' | 'completed'

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  status: GoalStatus
  progress: number // 0-100
  subtasks: SubTask[]
  category: string
  deadline?: string
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; glow: string; icon: string }> = {
  not_started: { label: 'Not Started', color: '#6B7280', glow: 'rgba(107, 114, 128, 0.3)', icon: '○' },
  in_progress: { label: 'In Progress', color: '#00D9FF', glow: 'rgba(0, 217, 255, 0.3)', icon: '◐' },
  completed: { label: 'Completed', color: '#63D866', glow: 'rgba(99, 216, 102, 0.3)', icon: '●' },
}

const SAMPLE_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Launch CasaFresh MVP',
    description: 'Complete the core real estate platform with agent automation and market analysis capabilities.',
    status: 'in_progress',
    progress: 68,
    category: 'Product',
    deadline: '2026-03-15',
    subtasks: [
      { id: 's1', title: 'Build mission control dashboard', completed: true },
      { id: 's2', title: 'Integrate multi-agent pipeline', completed: true },
      { id: 's3', title: 'Market brief automation', completed: true },
      { id: 's4', title: 'Lead scoring system', completed: false },
      { id: 's5', title: 'Client portal frontend', completed: false },
    ],
  },
  {
    id: 'g2',
    title: 'Content Pipeline Automation',
    description: 'Automate article and video content creation with AI-assisted research and writing.',
    status: 'in_progress',
    progress: 45,
    category: 'Marketing',
    deadline: '2026-04-01',
    subtasks: [
      { id: 's6', title: 'Article topic generation', completed: true },
      { id: 's7', title: 'Auto-research pipeline', completed: true },
      { id: 's8', title: 'Draft generation system', completed: false },
      { id: 's9', title: 'Video script automation', completed: false },
    ],
  },
  {
    id: 'g3',
    title: 'Secure First 10 Clients',
    description: 'Onboard initial client base through outreach, demos, and targeted marketing.',
    status: 'not_started',
    progress: 10,
    category: 'Sales',
    subtasks: [
      { id: 's10', title: 'Build lead list (100+ prospects)', completed: true },
      { id: 's11', title: 'Create demo deck', completed: false },
      { id: 's12', title: 'Email outreach campaign', completed: false },
      { id: 's13', title: 'Schedule 20 demos', completed: false },
      { id: 's14', title: 'Close 10 deals', completed: false },
    ],
  },
  {
    id: 'g4',
    title: 'Overnight Agent Reliability',
    description: 'Achieve 99%+ uptime for overnight automated operations with self-healing capabilities.',
    status: 'completed',
    progress: 100,
    category: 'Engineering',
    subtasks: [
      { id: 's15', title: 'Health check monitoring', completed: true },
      { id: 's16', title: 'Auto-restart on failure', completed: true },
      { id: 's17', title: 'Overnight report generation', completed: true },
      { id: 's18', title: 'Error alerting system', completed: true },
    ],
  },
]

function ProgressRing({ progress, size = 56, strokeWidth = 4, color }: {
  progress: number
  size?: number
  strokeWidth?: number
  color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold font-mono text-white">{progress}%</span>
      </div>
    </div>
  )
}

export default function GoalTracker() {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all')

  const filteredGoals = filter === 'all' ? SAMPLE_GOALS : SAMPLE_GOALS.filter(g => g.status === filter)

  const stats = {
    total: SAMPLE_GOALS.length,
    completed: SAMPLE_GOALS.filter(g => g.status === 'completed').length,
    inProgress: SAMPLE_GOALS.filter(g => g.status === 'in_progress').length,
    notStarted: SAMPLE_GOALS.filter(g => g.status === 'not_started').length,
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <span style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}>🎯</span>
            Goals
          </h2>
          <p className="text-sm text-gray-400">Track progress on key objectives</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(99, 216, 102, 0.1)', border: '1px solid rgba(99, 216, 102, 0.2)' }}>
            <span className="text-xs font-mono text-green-400">{stats.completed}/{stats.total}</span>
            <span className="text-[10px] text-gray-500">done</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'in_progress', 'not_started', 'completed'] as const).map(f => {
          const isActive = filter === f
          const label = f === 'all' ? 'All' : STATUS_CONFIG[f].label
          const color = f === 'all' ? '#00D9FF' : STATUS_CONFIG[f].color
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: isActive ? `${color}20` : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? `${color}60` : 'rgba(255, 255, 255, 0.08)'}`,
                color: isActive ? color : '#9CA3AF',
                boxShadow: isActive ? `0 0 12px ${color}20` : 'none',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredGoals.map(goal => {
          const statusCfg = STATUS_CONFIG[goal.status]
          const isExpanded = expandedGoal === goal.id
          const completedTasks = goal.subtasks.filter(s => s.completed).length
          const totalTasks = goal.subtasks.length

          return (
            <div
              key={goal.id}
              className="rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.01]"
              onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isExpanded ? `${statusCfg.color}50` : 'rgba(255, 255, 255, 0.08)'}`,
                boxShadow: isExpanded
                  ? `0 8px 40px rgba(0, 0, 0, 0.3), 0 0 30px ${statusCfg.glow}`
                  : '0 4px 24px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start gap-4">
                  <ProgressRing progress={goal.progress} color={statusCfg.color} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${statusCfg.color}20`,
                          color: statusCfg.color,
                          border: `1px solid ${statusCfg.color}30`,
                        }}
                      >
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">{goal.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1 truncate">{goal.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{goal.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${goal.progress}%`,
                            backgroundColor: statusCfg.color,
                            boxShadow: `0 0 8px ${statusCfg.glow}`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                        {completedTasks}/{totalTasks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Subtasks */}
              {isExpanded && (
                <div className="px-5 pb-5 animate-slideIn">
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Sub-tasks</span>
                      {goal.deadline && (
                        <span className="text-[10px] text-gray-600 font-mono">
                          Due: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {goal.subtasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200"
                        style={{
                          background: task.completed ? 'rgba(99, 216, 102, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 text-[10px]"
                          style={{
                            backgroundColor: task.completed ? 'rgba(99, 216, 102, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${task.completed ? 'rgba(99, 216, 102, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: task.completed ? '#63D866' : '#6B7280',
                          }}
                        >
                          {task.completed ? '✓' : ''}
                        </div>
                        <span
                          className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}
                        >
                          {task.title}
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

      {filteredGoals.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 opacity-50">🎯</div>
          <p className="text-gray-500 text-sm">No goals match this filter</p>
        </div>
      )}
    </div>
  )
}
