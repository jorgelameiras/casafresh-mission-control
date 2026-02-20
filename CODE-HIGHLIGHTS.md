# 🔍 Code Highlights - Key Implementation Details

## 🏢 OfficeView Component - Core Logic

### Character State Positioning
```tsx
const DESK_POSITIONS = {
  jarvis: { x: 10, y: 10 },    // Top-left
  codebot: { x: 60, y: 10 },   // Top-right
  reviewbot: { x: 10, y: 65 }, // Bottom-left
  bizbot: { x: 60, y: 65 },    // Bottom-right
}

const COMMON_AREA = { x: 35, y: 37.5 }  // Center
```

### Agent Avatars
```tsx
const AGENT_AVATARS: Record<string, string> = {
  jarvis: '👨‍💼',
  codebot: '🤖',
  reviewbot: '🔍',
  bizbot: '💼',
}
```

### Active vs Idle Logic
```tsx
{/* Character sits at desk when active, moves when idle/offline */}
{!isIdle && (
  <div
    className={`text-4xl transition-all duration-700 ${
      isActive ? 'animate-typing' : ''
    }`}
    style={{
      opacity: isOffline ? 0.2 : 1,
      filter: isOffline ? 'grayscale(100%)' : 'none',
    }}
  >
    {AGENT_AVATARS[agent.id]}
  </div>
)}

{/* Empty chair when idle */}
{isIdle && (
  <div className="text-2xl opacity-30">🪑</div>
)}
```

### Glowing Monitor Effect
```tsx
{/* Computer monitor */}
<div 
  className="relative mx-auto w-16 h-10 rounded-sm mb-2"
  style={{
    backgroundColor: '#0A0A0A',
    border: '2px solid #333',
    boxShadow: isActive 
      ? `0 0 20px ${agent.color}, inset 0 0 20px ${agent.color}40` 
      : 'none',
  }}
>
  {/* Screen glow when active */}
  {isActive && (
    <div 
      className="absolute inset-1 rounded-sm animate-pulse"
      style={{
        backgroundColor: agent.color,
        opacity: 0.3,
      }}
    />
  )}
</div>
```

### Idle Agents in Common Area
```tsx
{/* Idle agents gather here */}
<div className="absolute inset-0 flex items-center justify-center gap-2">
  {agents
    .filter(a => a.status === 'idle')
    .map((agent, idx) => (
      <div
        key={agent.id}
        className="transition-all duration-700 animate-float"
        style={{
          animationDelay: `${idx * 0.2}s`,
          opacity: 0.9,
        }}
      >
        <div className="text-3xl cursor-pointer">
          {AGENT_AVATARS[agent.id]}
        </div>
      </div>
    ))}
</div>
```

---

## 🎭 CSS Animations

### Floating Animation (Idle Agents)
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### Typing Animation (Active Agents)
```css
@keyframes typing {
  0%, 100% { transform: translateY(0px); }
  25% { transform: translateY(-2px); }
  50% { transform: translateY(0px); }
  75% { transform: translateY(-1px); }
}

.animate-typing {
  animation: typing 2s ease-in-out infinite;
}
```

---

## 📊 Timeline Component - Data Processing

### Group Activity by Hour
```tsx
useEffect(() => {
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
```

### Multi-Color Gradient Bars
```tsx
<div
  style={{
    height: `${height}%`,
    background: agentColors.length === 1
      ? agentColors[0]
      : `linear-gradient(to top, ${agentColors.join(', ')})`,
  }}
/>
```

---

## 💪 Workload Chart - Calculation

### Calculate Agent Workload
```tsx
useEffect(() => {
  const agentCounts: { [agentId: string]: { name: string; color: string; count: number } } = {}

  // Count assistant messages only
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
```

---

## 🔊 Sound Notification System

### Play Sound on Status Change
```tsx
const playNotificationSound = useCallback(() => {
  if (!soundEnabled) return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
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
```

### Detect Status Changes
```tsx
const previousAgentStatus = useRef<{ [agentId: string]: string }>({})

// In fetchAll callback:
newAgents.forEach((agent: Agent) => {
  const prevStatus = previousAgentStatus.current[agent.id]
  if (prevStatus && prevStatus !== agent.status) {
    playNotificationSound()
  }
  previousAgentStatus.current[agent.id] = agent.status
})
```

---

## ⚡ Performance Optimizations

### Smart Loading (No Flicker)
```tsx
const fetchAll = useCallback(async () => {
  // Only show loading spinner on first load, not on subsequent polls
  if (agents.length === 0) {
    setActivityLoading(true)
  }
  
  // ... fetch logic
  
}, [agents.length, playNotificationSound])
```

### Memoized Callbacks
```tsx
// Prevents unnecessary re-renders
const fetchAll = useCallback(async () => {
  // ... fetch logic
}, [agents.length, playNotificationSound])

const toggleSound = useCallback(() => {
  setSoundEnabled(prev => {
    const newValue = !prev
    localStorage.setItem(SOUND_ENABLED_KEY, String(newValue))
    return newValue
  })
}, [])
```

### useRef for Non-Reactive State
```tsx
// Doesn't trigger re-renders when updated
const previousAgentStatus = useRef<{ [agentId: string]: string }>({})
```

---

## 🎨 Interactive Modal

### Agent Detail Modal
```tsx
{selectedAgent && (
  <div 
    className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
    onClick={() => setSelectedAgent(null)}
  >
    <div 
      className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border"
      style={{ borderColor: agent?.color }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Agent info */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{AGENT_AVATARS[agent.id]}</span>
        <div>
          <h3 className="text-lg font-bold" style={{ color: agent.color }}>
            {agent.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            {agent.status.toUpperCase()}
          </p>
        </div>
      </div>
      
      {/* Details... */}
    </div>
  </div>
)}
```

---

## 🎯 Responsive Design

### View Mode Toggle (Hidden on Mobile)
```tsx
<div className="hidden sm:flex items-center gap-1">
  <button onClick={() => setViewMode('office')}>
    🏢 Office
  </button>
  <button onClick={() => setViewMode('cards')}>
    📊 Cards
  </button>
</div>
```

### Conditional Rendering Based on Size
```tsx
{/* Charts toggle - hidden on small screens */}
<button className="hidden md:flex items-center gap-1.5">
  📈 {showCharts ? 'Hide' : 'Show'} Charts
</button>

{/* Agent summary - hidden on small screens */}
<div className="hidden sm:flex items-center gap-3">
  {activeCount > 0 && (
    <span>🟢 {activeCount} active</span>
  )}
</div>
```

---

## 📱 localStorage Integration

### Save/Load Sound Preference
```tsx
const SOUND_ENABLED_KEY = 'casafresh-sound-enabled'

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem(SOUND_ENABLED_KEY)
  if (saved) {
    setSoundEnabled(saved === 'true')
  }
}, [])

// Save on change
const toggleSound = useCallback(() => {
  setSoundEnabled(prev => {
    const newValue = !prev
    localStorage.setItem(SOUND_ENABLED_KEY, String(newValue))
    return newValue
  })
}, [])
```

---

## 🎨 Color System

### Agent Colors (from API)
```tsx
interface Agent {
  id: string
  name: string
  color: string  // e.g., "#63D866"
  status: 'active' | 'idle' | 'offline'
  // ...
}
```

### Dynamic Styling
```tsx
<div
  style={{
    backgroundColor: '#111827',
    borderColor: agent.status !== 'offline' 
      ? `${agent.color}33`  // 33 = 20% opacity
      : '#1F2937',
    boxShadow: agent.status === 'active' 
      ? `0 0 20px ${agent.color}22`  // 22 = 13% opacity
      : 'none',
  }}
>
```

---

## 🔄 Real-time Updates

### Polling Strategy
```tsx
const POLL_INTERVAL = 5000  // 5 seconds

useEffect(() => {
  fetchAll()  // Initial fetch
  const interval = setInterval(fetchAll, POLL_INTERVAL)
  return () => clearInterval(interval)  // Cleanup
}, [fetchAll])
```

### Live Clock for Time Display
```tsx
const [, setTick] = useState(0)

useEffect(() => {
  const t = setInterval(() => setTick(n => n + 1), 1000)
  return () => clearInterval(t)
}, [])
```

---

## ✨ TypeScript Types

### Core Interfaces
```tsx
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
```

---

## 🎯 Key Takeaways

1. **CSS-first animations** - Lightweight, performant, no libraries needed
2. **Web Audio API** - Generate sounds programmatically, no audio files
3. **Smart polling** - Fetch data efficiently without flickering UI
4. **localStorage** - Persist user preferences across sessions
5. **TypeScript** - Full type safety throughout
6. **Responsive** - Mobile-first design with progressive enhancement
7. **Interactive** - Rich hover/click interactions for better UX

---

**All code is production-ready and fully tested! 🚀**
