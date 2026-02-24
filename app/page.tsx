'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import OfficeView from '@/components/OfficeView'
import ActivityFeed from '@/components/ActivityFeed'
import SnapshotBar from '@/components/SnapshotBar'
import TaskHistory from '@/components/TaskHistory'
import AgentTimeline from '@/components/AgentTimeline'
import WorkloadChart from '@/components/WorkloadChart'
import MemoryViewer from '@/components/MemoryViewer'
import SystemHealth from '@/components/SystemHealth'
import ArticleTracker from '@/components/ArticleTracker'
import VideoTracker from '@/components/VideoTracker'
import CalendarView from '@/components/CalendarView'
import GoalTracker from '@/components/GoalTracker'
import QuickActions from '@/components/QuickActions'
import HeaderBar from '@/components/HeaderBar'
import CRMView from '@/components/CRMView'
import LeadsView from '@/components/LeadsView'
import JobsView from '@/components/JobsView'

interface Agent {
  id: string
  name: string
  color: string
  status: 'active' | 'idle' | 'offline'
  lastActiveAt: string | null
  lastMessage: string | null
  sessionFile: string | null
}

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

interface Snapshot {
  leads: number
  properties: number
  ideas: number
  memoryFiles: number
  lastLogEntry: string | null
  updatedAt: string
}

const POLL_INTERVAL = 5000
const SOUND_ENABLED_KEY = 'casafresh-sound-enabled'

type ViewType = 'office' | 'calendar' | 'goals' | 'crm' | 'leads' | 'jobs' | 'analytics' | 'activity' | 'memory' | 'articles' | 'videos' | 'settings'

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('office')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  
  const previousAgentStatus = useRef<{ [agentId: string]: string }>({})

  // Load sound preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SOUND_ENABLED_KEY)
    if (saved) {
      setSoundEnabled(saved === 'true')
    }
  }, [])

  // Play notification sound when agent status changes
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return
    
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioCtx()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (err) {
      console.error('Sound playback error:', err)
    }
  }, [soundEnabled])

  const fetchAll = useCallback(async () => {
    try {
      const [agentsRes, activityRes, snapshotRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/activity'),
        fetch('/api/snapshot'),
      ])

      if (agentsRes.ok) {
        const data = await agentsRes.json()
        const newAgents = data.agents ?? []
        
        // Check for status changes and play sound
        newAgents.forEach((agent: Agent) => {
          const prevStatus = previousAgentStatus.current[agent.id]
          if (prevStatus && prevStatus !== agent.status) {
            playNotificationSound()
          }
          previousAgentStatus.current[agent.id] = agent.status
        })
        
        setAgents(newAgents)
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        setActivity(data.activity ?? [])
      }

      if (snapshotRes.ok) {
        const data = await snapshotRes.json()
        setSnapshot(data)
      }

      setLastRefresh(new Date())
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [playNotificationSound])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAll])

  // Mobile: close sidebar when view changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }, [currentView])

  // Render different views based on currentView
  const renderMainContent = () => {
    if (loading && agents.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="glass-strong rounded-xl p-12 animate-pulse"
            style={{
              boxShadow: '0 0 40px rgba(0, 217, 255, 0.2)',
            }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <p className="text-gray-400 text-sm">Loading Mission Control...</p>
            </div>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'office':
        return (
          <div className="flex-1 animate-fadeIn overflow-hidden">
            <OfficeView agents={agents} />
          </div>
        )

      case 'calendar':
        return <CalendarView />

      case 'goals':
        return <GoalTracker />

      case 'crm':
        return <CRMView />

      case 'leads':
        return <LeadsView />

      case 'jobs':
        return <JobsView />

      case 'analytics':
        return (
          <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">📊 Analytics</h2>
              <p className="text-sm text-gray-400">Agent performance and activity metrics</p>
            </div>
            
            <SnapshotBar snapshot={snapshot} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentTimeline activity={activity} />
              <WorkloadChart activity={activity} />
            </div>

            <SystemHealth />
          </div>
        )

      case 'activity':
        return (
          <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">📝 Activity Log</h2>
              <p className="text-sm text-gray-400">Real-time agent communications and tasks</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed activity={activity} loading={false} />
              <TaskHistory activity={activity} />
            </div>
          </div>
        )

      case 'memory':
        return (
          <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">💾 Memory</h2>
              <p className="text-sm text-gray-400">Business context and agent memory</p>
            </div>
            
            <MemoryViewer />
          </div>
        )

      case 'articles':
        return <ArticleTracker />

      case 'videos':
        return <VideoTracker />

      case 'settings':
        return (
          <div className="flex-1 p-4 md:p-8 space-y-6 animate-fadeIn overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">⚙️ Settings</h2>
              <p className="text-sm text-gray-400">Dashboard preferences and configuration</p>
            </div>
            
            <div 
              className="glass rounded-xl p-6 border border-white/10"
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                      Sound Notifications
                    </div>
                    <div className="text-xs text-gray-500">
                      Play sound when agent status changes
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled)
                      localStorage.setItem(SOUND_ENABLED_KEY, String(!soundEnabled))
                    }}
                    className={`
                      relative w-12 h-6 rounded-full transition-all duration-300
                      ${soundEnabled ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-700'}
                    `}
                    style={{
                      boxShadow: soundEnabled ? '0 0 20px rgba(0, 217, 255, 0.5)' : 'none',
                    }}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300
                        ${soundEnabled ? 'left-7' : 'left-1'}
                      `}
                      style={{
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div 
              className="glass rounded-xl p-6 border border-white/10"
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Poll Interval</span>
                  <span className="text-gray-200 font-mono">{POLL_INTERVAL / 1000}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Agents</span>
                  <span className="text-gray-200 font-mono">{agents.filter(a => a.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Events</span>
                  <span className="text-gray-200 font-mono">{activity.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Refresh</span>
                  <span className="text-gray-200 font-mono text-xs">
                    {lastRefresh?.toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">View not found</p>
          </div>
        )
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#0A0F1A' }}>
      {/* Sidebar */}
      <Sidebar
        agents={agents}
        currentView={currentView}
        onViewChange={(view: ViewType) => setCurrentView(view)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="lg:hidden fixed top-6 left-6 z-30 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span className="text-white text-xl">☰</span>
      </button>

      {/* Main Content Area */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Particle Background Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 2 === 0 ? '#00D9FF' : '#A855F7',
                animationDelay: `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden" style={{ zIndex: 1 }}>
          <HeaderBar
            agentCount={agents.length}
            activeCount={agents.filter(a => a.status === 'active').length}
          />
          {renderMainContent()}
        </div>

        {/* Status Bar */}
        <div
          className="glass-dark border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs flex-shrink-0"
          style={{
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-gray-500">CasaFresh © 2026</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 live-dot" />
              <span className="text-green-400 font-semibold">LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-gray-600">
            <span className="hidden md:inline">
              {agents.filter(a => a.status === 'active').length} active ·{' '}
              {agents.filter(a => a.status === 'idle').length} idle
            </span>
            <span className="font-mono">
              {lastRefresh?.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </main>

      {/* Floating Quick Actions */}
      <QuickActions />
    </div>
  )
}
