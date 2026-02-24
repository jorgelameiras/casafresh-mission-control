'use client'

import { useState, useEffect } from 'react'

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

/* ── Agent color themes ── */
interface AgentTheme {
  main: string
  dark: string
  darker: string
}

const AGENT_THEME: Record<string, AgentTheme> = {
  jarvis:    { main: '#00D9FF', dark: '#0099B3', darker: '#006678' },
  codebot:   { main: '#4ADE80', dark: '#2D8C4E', darker: '#1a5c30' },
  reviewbot: { main: '#A855F7', dark: '#7C3AED', darker: '#5521a6' },
  bizbot:    { main: '#F59E0B', dark: '#B45309', darker: '#7a3806' },
}
const FALLBACK_THEME: AgentTheme = { main: '#888', dark: '#666', darker: '#444' }

/* ── Desk positions (% of container), arranged 2x2 ── */
interface Position {
  left: number
  top: number
}

const DESK_POS: Record<string, Position> = {
  jarvis:    { left: 8,  top: 50 },
  codebot:   { left: 50, top: 48 },
  reviewbot: { left: 8,  top: 72 },
  bizbot:    { left: 50, top: 70 },
}

/* ── Idle lounge spots near the break area ── */
const IDLE_POS: Record<string, Position> = {
  jarvis:    { left: 32, top: 58 },
  codebot:   { left: 42, top: 62 },
  reviewbot: { left: 35, top: 66 },
  bizbot:    { left: 44, top: 56 },
}

/* ── Desk z-order (front row renders on top) ── */
const DESK_Z: Record<string, number> = {
  jarvis: 3, codebot: 2, reviewbot: 5, bizbot: 4,
}

/* ── Dust particle configs ── */
const DUST_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: 58 + Math.random() * 30,
  top: 20 + Math.random() * 50,
  duration: 8 + Math.random() * 4,
  delay: Math.random() * 6,
}))

/* ═══════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════ */

function JarvisHead({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div
      style={{
        width: 14, height: 14,
        backgroundColor: color,
        borderRadius: 2,
        position: 'relative',
        margin: '0 auto',
        boxShadow: glow ? `0 0 8px ${color}60` : 'none',
      }}
    >
      {/* Antenna */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 2, height: 4, backgroundColor: color }} />
      <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, backgroundColor: color, borderRadius: '50%', boxShadow: `0 0 4px ${color}` }} />
      {/* Visor eye (one wide rectangle) */}
      <div style={{ position: 'absolute', top: 5, left: 2, right: 2, height: 3, backgroundColor: '#00f7ff', boxShadow: '0 0 3px #00f7ff' }} />
    </div>
  )
}

function CodebotHead({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div
      style={{
        width: 14, height: 14,
        backgroundColor: color,
        borderRadius: 2,
        position: 'relative',
        margin: '0 auto',
        boxShadow: glow ? `0 0 8px ${color}60` : 'none',
      }}
    >
      {/* Hood point */}
      <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 6, height: 3, backgroundColor: color, borderRadius: '2px 2px 0 0' }} />
      {/* Glasses bridge */}
      <div style={{ position: 'absolute', top: 4, left: 1, right: 1, height: 2, backgroundColor: '#1a1210', borderRadius: 1 }} />
      {/* Left eye */}
      <div style={{ position: 'absolute', top: 4, left: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
      {/* Right eye */}
      <div style={{ position: 'absolute', top: 4, right: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
    </div>
  )
}

function ReviewbotHead({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div
      style={{
        width: 14, height: 14,
        backgroundColor: color,
        borderRadius: 2,
        position: 'relative',
        margin: '0 auto',
        boxShadow: glow ? `0 0 8px ${color}60` : 'none',
      }}
    >
      {/* Detective hat */}
      <div style={{ position: 'absolute', top: -5, left: -2, width: 18, height: 5, backgroundColor: '#7C3AED', borderRadius: '2px 2px 0 0' }} />
      <div style={{ position: 'absolute', top: -3, left: 1, width: 12, height: 3, backgroundColor: '#6D28D9' }} />
      {/* Left eye */}
      <div style={{ position: 'absolute', top: 5, left: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
      {/* Right eye */}
      <div style={{ position: 'absolute', top: 5, right: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
    </div>
  )
}

function BizbotHead({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <div
      style={{
        width: 14, height: 14,
        backgroundColor: color,
        borderRadius: 2,
        position: 'relative',
        margin: '0 auto',
        boxShadow: glow ? `0 0 8px ${color}60` : 'none',
      }}
    >
      {/* Left eye */}
      <div style={{ position: 'absolute', top: 4, left: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
      {/* Right eye */}
      <div style={{ position: 'absolute', top: 4, right: 2, width: 3, height: 3, backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 2, height: 2, backgroundColor: '#1a1210' }} />
      </div>
    </div>
  )
}

function AgentHead({ agentId, color, glow }: { agentId: string; color: string; glow?: boolean }) {
  switch (agentId) {
    case 'jarvis': return <JarvisHead color={color} glow={glow} />
    case 'codebot': return <CodebotHead color={color} glow={glow} />
    case 'reviewbot': return <ReviewbotHead color={color} glow={glow} />
    case 'bizbot': return <BizbotHead color={color} glow={glow} />
    default: return <BizbotHead color={color} glow={glow} />
  }
}

function AgentBody({ agentId, theme, seated }: { agentId: string; theme: AgentTheme; seated: boolean }) {
  const bodyHeight = seated ? 12 : 14
  return (
    <div style={{ position: 'relative' }}>
      {/* Body */}
      <div
        style={{
          width: agentId === 'codebot' ? 14 : 12,
          height: bodyHeight,
          backgroundColor: theme.dark,
          margin: '0 auto',
          position: 'relative',
          borderRadius: agentId === 'codebot' ? '2px 2px 0 0' : 0,
        }}
      >
        {/* Bizbot tie */}
        {agentId === 'bizbot' && (
          <div style={{
            position: 'absolute', top: 1, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderTop: `6px solid ${theme.main}`,
          }} />
        )}
      </div>
      {/* Reviewbot magnifying glass */}
      {agentId === 'reviewbot' && (
        <div style={{ position: 'absolute', top: 2, right: -10 }}>
          <div style={{ width: 7, height: 7, border: `2px solid ${theme.main}`, borderRadius: '50%' }} />
          <div style={{ width: 2, height: 5, backgroundColor: theme.main, marginLeft: 5, marginTop: -1, transform: 'rotate(45deg)' }} />
        </div>
      )}
      {/* Shadow */}
      <div style={{ width: 8, height: 3, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '50%', margin: '0 auto', marginTop: seated ? 0 : 2 }} />
    </div>
  )
}

function SpeechBubble({ text, style: extraStyle }: { text: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#e8dcc4',
        color: '#1a1210',
        fontSize: 8,
        fontFamily: 'monospace',
        padding: '3px 6px',
        maxWidth: 160,
        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        zIndex: 20,
        borderRadius: 2,
        ...extraStyle,
      }}
    >
      {text.slice(0, 35)}{text.length > 35 ? '...' : ''}
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          left: 12,
          width: 0, height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid #e8dcc4',
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

/* ── Time-of-day palette ── */
type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours()
  if (h >= 6 && h < 8) return 'dawn'
  if (h >= 8 && h < 18) return 'day'
  if (h >= 18 && h < 20) return 'dusk'
  return 'night'
}

const TIME_PALETTE: Record<TimeOfDay, {
  roomBg: string
  wallTop: string
  wallBot: string
  floor: string
  floorLine: string
  baseboard: string
  windowBg: string
  windowGradient: string
  treeFill: string
  treeDark: string
  shaftColor: string
  shaftOpacity: [number, number]
  overlayTint: string
  sparkleOpacity: number
}> = {
  dawn: {
    roomBg: 'linear-gradient(180deg, #16120e 0%, #1e1812 100%)',
    wallTop: '#3e2c1c', wallBot: '#5c3c2c',
    floor: '#c0a474', floorLine: '#b09464', baseboard: '#2c1c0c',
    windowBg: '#f0a848', windowGradient: 'linear-gradient(180deg, #f8c868 0%, #f0a848 40%, #d88830 100%)',
    treeFill: '#3a6a1a', treeDark: '#2a5a0a',
    shaftColor: 'rgba(240,180,80,0.12)', shaftOpacity: [0.06, 0.14],
    overlayTint: 'rgba(240,180,80,0.04)', sparkleOpacity: 0.6,
  },
  day: {
    roomBg: 'linear-gradient(180deg, #12100e 0%, #1a1510 100%)',
    wallTop: '#3a2818', wallBot: '#5a3828',
    floor: '#c4a878', floorLine: '#b89868', baseboard: '#2a1808',
    windowBg: '#88e840', windowGradient: 'linear-gradient(180deg, #a8f860 0%, #88e840 40%, #68c830 100%)',
    treeFill: '#4a8a1a', treeDark: '#3a7a0a',
    shaftColor: 'rgba(140,220,80,0.10)', shaftOpacity: [0.05, 0.12],
    overlayTint: 'transparent', sparkleOpacity: 0.9,
  },
  dusk: {
    roomBg: 'linear-gradient(180deg, #100e0c 0%, #181210 100%)',
    wallTop: '#342420', wallBot: '#4a3028',
    floor: '#b09068', floorLine: '#a08058', baseboard: '#241408',
    windowBg: '#c85828', windowGradient: 'linear-gradient(180deg, #e88848 0%, #c85828 40%, #883818 100%)',
    treeFill: '#2a4a10', treeDark: '#1a3a08',
    shaftColor: 'rgba(200,100,40,0.08)', shaftOpacity: [0.03, 0.08],
    overlayTint: 'rgba(200,100,40,0.03)', sparkleOpacity: 0.4,
  },
  night: {
    roomBg: 'linear-gradient(180deg, #0a0808 0%, #0e0c0a 100%)',
    wallTop: '#241a14', wallBot: '#362418',
    floor: '#8a7458', floorLine: '#7a6448', baseboard: '#1a0e04',
    windowBg: '#0a1228', windowGradient: 'linear-gradient(180deg, #0c1830 0%, #0a1228 40%, #060e1e 100%)',
    treeFill: '#0c1a08', treeDark: '#081408',
    shaftColor: 'rgba(60,80,140,0.04)', shaftOpacity: [0.01, 0.04],
    overlayTint: 'rgba(0,0,30,0.15)', sparkleOpacity: 0.0,
  },
}

export default function OfficeView({ agents }: OfficeViewProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay)

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000)
    return () => clearInterval(interval)
  }, [])

  const theme = (id: string): AgentTheme => AGENT_THEME[id] ?? FALLBACK_THEME
  const pal = TIME_PALETTE[timeOfDay]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: pal.roomBg,
        imageRendering: 'pixelated',
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: 0,
        lineHeight: 1,
      }}
    >
      {/* ── CSS Keyframes ─────────────────────────── */}
      <style>{`
        @keyframes pxo-shaft {
          0%, 100% { opacity: ${pal.shaftOpacity[0]}; transform: skewX(-20deg) translateX(0); }
          50%       { opacity: ${pal.shaftOpacity[1]}; transform: skewX(-20deg) translateX(4px); }
        }
        @keyframes pxo-crt {
          0%   { opacity: 1;    }
          25%  { opacity: 0.92; }
          50%  { opacity: 0.97; }
          75%  { opacity: 0.94; }
          100% { opacity: 1;    }
        }
        @keyframes pxo-sparkle {
          0%, 100% { opacity: ${pal.sparkleOpacity * 0.1}; }
          50%      { opacity: ${pal.sparkleOpacity}; }
        }
        @keyframes pxo-type {
          0%, 100% { transform: translateY(0);    }
          50%      { transform: translateY(-2px); }
        }
        @keyframes pxo-float {
          0%, 100% { transform: translateY(0);    }
          50%      { transform: translateY(-3px); }
        }
        @keyframes pxo-sparks {
          0%, 100% { opacity: 0; }
          50%      { opacity: 1; }
        }
        @keyframes pxo-breathe {
          0%, 100% { transform: scaleY(1);    }
          50%      { transform: scaleY(0.92); }
        }
        @keyframes pxo-minute {
          from { transform: translate(-50%, -100%) rotate(0deg);   }
          to   { transform: translate(-50%, -100%) rotate(360deg); }
        }
        @keyframes pxo-dust {
          0%   { opacity: 0.15; transform: translate(0, 0); }
          50%  { opacity: 0.3;  transform: translate(20px, -15px); }
          100% { opacity: 0.15; transform: translate(40px, -30px); }
        }
      `}</style>

      {/* ══════════ ROOM STRUCTURE ══════════ */}

      {/* Back wall */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '45%',
          background: `linear-gradient(180deg, ${pal.wallTop} 0%, ${pal.wallBot} 100%)`,
          transition: 'background 2s ease',
        }}
      />

      {/* Baseboard */}
      <div
        style={{
          position: 'absolute',
          top: '44.5%', left: 0, right: 0,
          height: '1%',
          backgroundColor: pal.baseboard,
          transition: 'background-color 2s ease',
        }}
      />

      {/* Floor */}
      <div
        style={{
          position: 'absolute',
          top: '45%', left: 0, right: 0, bottom: 0,
          backgroundColor: pal.floor,
          backgroundImage:
            `repeating-linear-gradient(90deg, transparent, transparent 60px, ${pal.floorLine} 60px, ${pal.floorLine} 62px)`,
          transition: 'background-color 2s ease',
        }}
      />

      {/* ══════════ WINDOW (right side of wall) ══════════ */}
      <div
        style={{
          position: 'absolute',
          right: '6%', top: '4%',
          width: '28%', height: '34%',
          backgroundColor: pal.windowBg,
          border: `5px solid ${pal.wallBot}`,
          boxShadow: `inset 0 0 0 2px ${pal.wallTop}, 0 2px 0 ${pal.baseboard}`,
          overflow: 'hidden',
          transition: 'background-color 2s ease',
        }}
      >
        {/* Sky / Nature gradient */}
        <div style={{ position: 'absolute', inset: 0, background: pal.windowGradient, transition: 'background 2s ease' }} />
        {/* Stars at night */}
        {timeOfDay === 'night' && (
          <>
            <div style={{ position: 'absolute', top: '10%', left: '20%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: '18%', left: '55%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.5 }} />
            <div style={{ position: 'absolute', top: '8%', left: '75%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: '25%', left: '35%', width: 1, height: 1, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.4 }} />
            <div style={{ position: 'absolute', top: '14%', left: '88%', width: 1, height: 1, backgroundColor: '#fff', borderRadius: '50%', opacity: 0.6 }} />
            {/* Moon */}
            <div style={{ position: 'absolute', top: '8%', right: '18%', width: 14, height: 14, backgroundColor: '#e8e0c8', borderRadius: '50%', boxShadow: '0 0 8px rgba(232,224,200,0.4)' }} />
          </>
        )}
        {/* Tree silhouettes */}
        <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 22, height: 36, backgroundColor: pal.treeFill, borderRadius: '4px 4px 0 0', transition: 'background-color 2s ease' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '40%', width: 16, height: 26, backgroundColor: pal.treeDark, borderRadius: '3px 3px 0 0', transition: 'background-color 2s ease' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', width: 24, height: 32, backgroundColor: pal.treeFill, borderRadius: '4px 4px 0 0', transition: 'background-color 2s ease' }} />
        {/* Tree trunks */}
        <div style={{ position: 'absolute', bottom: '5%', left: 'calc(10% + 8px)', width: 4, height: 8, backgroundColor: '#6b4a2a' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: 'calc(40% + 5px)', width: 3, height: 6, backgroundColor: '#6b4a2a' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: 'calc(10% + 8px)', width: 4, height: 8, backgroundColor: '#6b4a2a' }} />
        {/* Venetian blinds */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(180deg, rgba(210,190,150,0.5) 0px, rgba(210,190,150,0.5) 3px, transparent 3px, transparent 9px)',
          }}
        />
        {/* Sparkle glints */}
        <div style={{ position: 'absolute', top: '14%', left: '20%', width: 3, height: 3, backgroundColor: '#fff', borderRadius: '50%', animation: 'pxo-sparkle 2s ease-in-out infinite 0s' }} />
        <div style={{ position: 'absolute', top: '42%', right: '22%', width: 2, height: 2, backgroundColor: '#fff', borderRadius: '50%', animation: 'pxo-sparkle 2s ease-in-out infinite 0.7s' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '55%', width: 3, height: 3, backgroundColor: '#fff', borderRadius: '50%', animation: 'pxo-sparkle 2s ease-in-out infinite 1.3s' }} />
      </div>

      {/* ══════════ LIGHT SHAFTS ══════════ */}
      {[0, 1, 2, 3].map(i => (
        <div
          key={`shaft-${i}`}
          style={{
            position: 'absolute',
            right: `${6 + i * 8}%`, top: '38%',
            width: '5%', height: '55%',
            background: `linear-gradient(180deg, ${pal.shaftColor} 0%, transparent 100%)`,
            animation: `pxo-shaft 5s ease-in-out infinite ${i * 1.2}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ══════════ DUST PARTICLES ══════════ */}
      {DUST_PARTICLES.map(d => (
        <div
          key={`dust-${d.id}`}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: 2, height: 2,
            backgroundColor: 'rgba(200,180,140,0.3)',
            borderRadius: '50%',
            animation: `pxo-dust ${d.duration}s ease-in-out infinite ${d.delay}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ══════════ BULLETIN BOARD (left wall) ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '4%', top: '5%',
          width: '16%', height: '28%',
          backgroundColor: '#a08050',
          border: '3px solid #5a3828',
          boxShadow: '0 2px 0 #3a2018, inset 0 0 4px rgba(0,0,0,0.2)',
          padding: 6,
          display: 'flex', flexWrap: 'wrap', gap: 3,
          alignContent: 'flex-start',
        }}
      >
        {['#e85858','#58a8e8','#e8d858','#58e888','#e8a858','#8858e8','#e878a8','#58d8c8'].map((c, i) => (
          <div
            key={`note-${i}`}
            style={{
              width: i % 3 === 0 ? 16 : 12,
              height: i % 2 === 0 ? 12 : 15,
              backgroundColor: c,
              boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>

      {/* ══════════ GREEN DISPLAY (retro data terminal) ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '26%', top: '6%',
          width: '18%', height: '24%',
          backgroundColor: '#0a1a08',
          border: '3px solid #2a3a28',
          boxShadow: '0 2px 0 #1a1210, inset 0 0 12px rgba(74,140,58,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Scan lines */}
        <div
          style={{
            position: 'absolute', inset: 3,
            backgroundImage: 'repeating-linear-gradient(180deg, rgba(74,140,58,0.3) 0px, rgba(74,140,58,0.3) 1px, transparent 1px, transparent 4px)',
          }}
        />
        {/* Green data dots and lines */}
        {[
          { x: '10%', y: '10%' }, { x: '28%', y: '10%' }, { x: '48%', y: '10%' }, { x: '68%', y: '10%' }, { x: '85%', y: '10%' },
          { x: '10%', y: '30%' }, { x: '30%', y: '30%' }, { x: '58%', y: '30%' },
          { x: '10%', y: '50%' }, { x: '38%', y: '50%' }, { x: '65%', y: '50%' }, { x: '82%', y: '50%' },
          { x: '18%', y: '70%' }, { x: '45%', y: '70%' }, { x: '72%', y: '70%' },
          { x: '10%', y: '88%' }, { x: '55%', y: '88%' },
        ].map((d, i) => (
          <div key={`gd-${i}`} style={{ position: 'absolute', left: d.x, top: d.y, width: 3, height: 3, backgroundColor: '#7bce5a', borderRadius: '50%', boxShadow: '0 0 4px #7bce5a' }} />
        ))}
        {/* Connecting lines */}
        <div style={{ position: 'absolute', left: '10%', top: '11%', width: '75%', height: 1, backgroundColor: 'rgba(123,206,90,0.2)' }} />
        <div style={{ position: 'absolute', left: '10%', top: '31%', width: '48%', height: 1, backgroundColor: 'rgba(123,206,90,0.2)' }} />
        <div style={{ position: 'absolute', left: '10%', top: '51%', width: '72%', height: 1, backgroundColor: 'rgba(123,206,90,0.15)' }} />
      </div>

      {/* ══════════ CLOCK ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '22%', top: '7%',
          width: 18, height: 18,
          backgroundColor: '#d4c4a0',
          border: '2px solid #5a3828',
          borderRadius: '50%',
        }}
      >
        {/* Hour hand */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 2, height: 5, backgroundColor: '#1a1210', transformOrigin: 'center bottom', transform: 'translate(-50%, -100%) rotate(30deg)' }} />
        {/* Minute hand (animated) */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1, height: 7, backgroundColor: '#1a1210', transformOrigin: 'center bottom', animation: 'pxo-minute 3600s linear infinite' }} />
        {/* Center dot */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 3, height: 3, backgroundColor: '#1a1210', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* ══════════ "CASAFRESH HQ" TEXT ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '48%', top: '3%',
          color: '#8b7b65',
          fontSize: 9, fontFamily: 'monospace',
          letterSpacing: 2,
          textTransform: 'uppercase',
          textShadow: '0 1px 0 #3a2018',
        }}
      >
        CASAFRESH HQ
      </div>

      {/* ══════════ BOOKSHELF (back wall) ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '48%', top: '10%',
          width: '14%', height: '20%',
          backgroundColor: '#4a3020',
          border: '2px solid #3a2010',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          padding: '4px 3px',
        }}
      >
        {/* Shelf rows */}
        {[0, 1, 2].map(row => (
          <div key={`shelf-${row}`} style={{ display: 'flex', gap: 2, alignItems: 'flex-end', borderBottom: '2px solid #3a2010', paddingBottom: 2 }}>
            {['#c85858', '#5888c8', '#c8b858', '#58a878', '#a858c8', '#c87858'].slice(row * 2, row * 2 + 3).map((c, i) => (
              <div key={`book-${row}-${i}`} style={{ width: 6 + (i % 2) * 2, height: 12 + (i % 3) * 4, backgroundColor: c, borderRadius: 1 }} />
            ))}
          </div>
        ))}
      </div>

      {/* ══════════ FILING CABINET + PIXEL CAT ══════════ */}
      <div style={{ position: 'absolute', left: '2%', top: '35%', width: 40, height: 74, zIndex: 2 }}>
        {/* 3 drawers */}
        {[0, 1, 2].map(i => (
          <div
            key={`dr-${i}`}
            style={{
              width: '100%', height: 24,
              backgroundColor: i === 0 ? '#5a4535' : '#4a3525',
              borderBottom: '2px solid #3a2515',
              boxShadow: 'inset 0 1px 0 #6a5545',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', width: 10, height: 3, backgroundColor: '#8b7b65', boxShadow: '0 1px 0 #6a5545' }} />
          </div>
        ))}

        {/* Sleeping pixel cat */}
        <div style={{ position: 'absolute', top: -14, right: 2, animation: 'pxo-breathe 3s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <div style={{ width: 12, height: 7, backgroundColor: '#e8a858', borderRadius: 1, position: 'relative' }}>
            {/* Ears */}
            <div style={{ position: 'absolute', top: -3, left: 1, width: 0, height: 0, borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderBottom: '3px solid #e8a858' }} />
            <div style={{ position: 'absolute', top: -3, right: 1, width: 0, height: 0, borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderBottom: '3px solid #e8a858' }} />
            {/* Closed eyes */}
            <div style={{ position: 'absolute', top: 2, left: 2, width: 2, height: 1, backgroundColor: '#1a1210' }} />
            <div style={{ position: 'absolute', top: 2, right: 2, width: 2, height: 1, backgroundColor: '#1a1210' }} />
          </div>
          {/* Tail */}
          <div style={{ position: 'absolute', right: -6, bottom: 0, width: 6, height: 2, backgroundColor: '#d89848', borderRadius: '0 2px 2px 0' }} />
        </div>
      </div>

      {/* ══════════ POTTED PLANTS (near window) ══════════ */}
      {[
        { left: '72%', top: '36%', sz: 22 },
        { left: '84%', top: '38%', sz: 18 },
        { left: '92%', top: '37%', sz: 16 },
      ].map((p, i) => (
        <div key={`pl-${i}`} style={{ position: 'absolute', left: p.left, top: p.top, zIndex: 1 }}>
          {/* Leaves */}
          <div style={{ width: p.sz, height: p.sz - 4, backgroundColor: '#5a9a3a', borderRadius: '40%', boxShadow: '0 0 0 1px #4a8a2a', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 2, left: 2, width: p.sz / 2 - 2, height: p.sz / 2 - 4, backgroundColor: '#6aaa4a', borderRadius: '40%' }} />
          </div>
          {/* Pot */}
          <div style={{ width: p.sz - 4, height: 10, backgroundColor: '#8b5535', margin: '0 auto', marginTop: -2, borderRadius: '0 0 2px 2px', boxShadow: '0 1px 0 #5a3525' }} />
        </div>
      ))}

      {/* ══════════ WATER COOLER (break area) ══════════ */}
      <div style={{ position: 'absolute', left: '38%', top: '42%', zIndex: 2 }}>
        {/* Jug */}
        <div style={{ width: 16, height: 20, backgroundColor: '#a8d8f0', border: '1px solid #88b8d0', borderRadius: '3px 3px 0 0', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 5, height: 10, backgroundColor: '#c8e8ff', borderRadius: 1, opacity: 0.6 }} />
        </div>
        {/* Stand */}
        <div style={{ width: 20, height: 14, backgroundColor: '#585860', marginLeft: -2, boxShadow: '0 1px 0 #1a1210' }} />
        {/* Spigot */}
        <div style={{ position: 'absolute', right: -5, top: 20, width: 5, height: 3, backgroundColor: '#e85858', borderRadius: 1 }} />
      </div>

      {/* ══════════ BREAK AREA RUG ══════════ */}
      <div
        style={{
          position: 'absolute',
          left: '32%', top: '56%',
          width: 60, height: 20,
          backgroundColor: '#8b3535',
          borderRadius: '50%',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
          opacity: 0.7,
          zIndex: 1,
        }}
      >
        {/* Rug pattern */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '50%', border: '1px solid rgba(200,160,120,0.3)', borderRadius: '50%' }} />
      </div>

      {/* ══════════ AGENT DESKS & CHARACTERS ══════════ */}
      {agents.map(agent => {
        const desk = DESK_POS[agent.id]
        const idle = IDLE_POS[agent.id]
        const t = theme(agent.id)
        const z = DESK_Z[agent.id] ?? 1
        if (!desk) return null

        const isActive = agent.status === 'active'
        const isIdle = agent.status === 'idle'
        const isOffline = agent.status === 'offline'
        const isHovered = hoveredAgent === agent.id

        return (
          <div key={agent.id}>

            {/* ── DESK UNIT ── */}
            <div
              style={{
                position: 'absolute',
                left: `${desk.left}%`,
                top: `${desk.top}%`,
                zIndex: z,
              }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {/* Desk surface */}
              <div
                style={{
                  width: 140, height: 22,
                  backgroundColor: '#c8a878',
                  borderBottom: '4px solid #8b6b55',
                  boxShadow: '-2px 0 0 #b89868, 2px 0 0 #b89868, 0 2px 0 #6b4535',
                  position: 'relative',
                }}
              >
                {/* Desk legs */}
                <div style={{ position: 'absolute', bottom: -20, left: 4, width: 4, height: 16, backgroundColor: '#8b6b55', boxShadow: '1px 0 0 #6b4535' }} />
                <div style={{ position: 'absolute', bottom: -20, right: 4, width: 4, height: 16, backgroundColor: '#8b6b55', boxShadow: '1px 0 0 #6b4535' }} />
              </div>

              {/* CRT Monitor */}
              <div
                style={{
                  position: 'absolute',
                  top: -44, left: 16,
                  width: 52, height: 40,
                  backgroundColor: '#2a2a30',
                  border: '4px solid #585860',
                  boxShadow: isActive
                    ? `0 0 12px ${t.main}60, inset 0 0 8px ${t.main}30`
                    : isIdle
                      ? `0 0 4px ${t.main}20`
                      : '0 1px 0 #1a1210',
                  animation: isActive ? 'pxo-crt 0.15s steps(4) infinite' : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: `${t.main}20` }}>
                    {/* Scan lines */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0px, transparent 1px, rgba(0,0,0,0.12) 1px, rgba(0,0,0,0.12) 2px)', pointerEvents: 'none' }} />
                    {/* Code lines */}
                    {[0, 1, 2, 3, 4, 5].map(ln => (
                      <div key={ln} style={{ width: `${35 + ((ln * 17) % 50)}%`, height: 2, backgroundColor: t.main, opacity: 0.6, margin: '3px 3px' }} />
                    ))}
                  </div>
                )}
                {isOffline && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: '#0a0a0a' }} />
                )}
                {isIdle && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: `${t.main}08` }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0px, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)' }} />
                  </div>
                )}
              </div>

              {/* Monitor stand */}
              <div style={{ position: 'absolute', top: -8, left: 34, width: 16, height: 8, backgroundColor: '#585860', boxShadow: '0 1px 0 #3a3a40' }} />

              {/* Keyboard */}
              <div
                style={{
                  position: 'absolute',
                  top: -6, left: 74,
                  width: 36, height: 12,
                  backgroundColor: '#585860',
                  boxShadow: '0 1px 0 #3a3a40, inset 0 1px 0 #686870',
                  borderRadius: 1,
                  overflow: 'hidden',
                  padding: 1,
                }}
              >
                {[0, 1, 2].map(row => (
                  <div key={row} style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
                    {Array.from({ length: 8 - row }, (_, k) => (
                      <div key={k} style={{ width: 3, height: 2, backgroundColor: '#787880' }} />
                    ))}
                  </div>
                ))}
              </div>

              {/* Coffee mug */}
              <div
                style={{
                  position: 'absolute',
                  top: -13, right: 8,
                  width: 9, height: 11,
                  backgroundColor: t.main,
                  boxShadow: `0 1px 0 ${t.dark}`,
                  borderRadius: '0 0 1px 1px',
                }}
              >
                <div style={{ position: 'absolute', right: -3, top: 2, width: 3, height: 5, border: `1px solid ${t.dark}`, borderLeft: 'none', borderRadius: '0 2px 2px 0' }} />
              </div>

              {/* Office chair */}
              <div
                style={{
                  position: 'absolute',
                  top: isOffline ? 14 : 4,
                  left: isOffline ? 56 : 38,
                  transition: 'all 0.5s ease',
                }}
              >
                {/* Chair back */}
                <div style={{ width: 24, height: 18, backgroundColor: '#3a3a42', borderRadius: '3px 3px 0 0', boxShadow: 'inset 0 1px 0 #4a4a52, 0 0 0 1px #2a2a30' }} />
                {/* Seat */}
                <div style={{ width: 28, height: 7, backgroundColor: '#3a3a42', borderRadius: 1, marginLeft: -2, boxShadow: '0 1px 0 #2a2a30' }} />
                {/* Stem */}
                <div style={{ width: 4, height: 8, backgroundColor: '#2a2a30', margin: '0 auto' }} />
                {/* Wheel base */}
                <div style={{ width: 22, height: 3, backgroundColor: '#2a2a30', margin: '0 auto', borderRadius: 1 }} />
              </div>

              {/* ── ACTIVE: Sitting character + typing ── */}
              {isActive && (
                <div style={{ position: 'absolute', top: -38, left: 40, animation: 'pxo-type 0.5s ease-in-out infinite', zIndex: 5 }}>
                  {/* Name label */}
                  <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: t.main, letterSpacing: 1, whiteSpace: 'nowrap', textShadow: `0 0 6px ${t.main}`, fontFamily: 'monospace' }}>
                    {agent.name}
                  </div>
                  <AgentHead agentId={agent.id} color={t.main} glow />
                  <AgentBody agentId={agent.id} theme={t} seated />
                  {/* Typing sparks */}
                  <div style={{ position: 'absolute', bottom: 0, right: -16, width: 3, height: 3, backgroundColor: t.main, borderRadius: '50%', animation: 'pxo-sparks 0.4s ease-in-out infinite' }} />
                  <div style={{ position: 'absolute', bottom: 2, right: -22, width: 2, height: 2, backgroundColor: t.main, borderRadius: '50%', animation: 'pxo-sparks 0.4s ease-in-out infinite 0.2s' }} />
                </div>
              )}

              {/* Speech bubble (active, hovered) */}
              {isActive && agent.lastMessage && isHovered && (
                <SpeechBubble text={agent.lastMessage} style={{ position: 'absolute', top: -68, left: 6 }} />
              )}
            </div>

            {/* ── IDLE: Standing character in break area ── */}
            {isIdle && idle && (
              <div
                style={{
                  position: 'absolute',
                  left: `${idle.left}%`, top: `${idle.top}%`,
                  animation: 'pxo-float 3s ease-in-out infinite',
                  zIndex: 6,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* Name label */}
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: t.main, letterSpacing: 1, whiteSpace: 'nowrap', textShadow: `0 0 6px ${t.main}`, fontFamily: 'monospace' }}>
                  {agent.name}
                </div>
                <AgentHead agentId={agent.id} color={t.main} glow />
                <AgentBody agentId={agent.id} theme={t} seated={false} />
                {/* Legs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: -3 }}>
                  <div style={{ width: 4, height: 10, backgroundColor: t.darker }} />
                  <div style={{ width: 4, height: 10, backgroundColor: t.darker }} />
                </div>

                {/* Speech bubble (idle, hovered) */}
                {agent.lastMessage && isHovered && (
                  <SpeechBubble text={agent.lastMessage} style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)' }} />
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* ══════════ TIME-OF-DAY OVERLAY ══════════ */}
      {pal.overlayTint !== 'transparent' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: pal.overlayTint,
            pointerEvents: 'none',
            zIndex: 9,
            transition: 'background-color 2s ease',
          }}
        />
      )}

      {/* ══════════ LEGEND ══════════ */}
      <div
        style={{
          position: 'absolute',
          bottom: 8, left: 8,
          display: 'flex', gap: 14,
          fontSize: 8, fontFamily: 'monospace',
          color: '#8b7b65',
          backgroundColor: 'rgba(18,16,14,0.88)',
          padding: '5px 12px',
          boxShadow: '0 1px 0 #3a2018',
          borderRadius: 2,
          zIndex: 10,
        }}
      >
        {[
          { label: 'ACTIVE', color: '#4ADE80' },
          { label: 'IDLE', color: '#F59E0B' },
          { label: 'OFFLINE', color: '#585860' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, backgroundColor: item.color, borderRadius: '50%' }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
