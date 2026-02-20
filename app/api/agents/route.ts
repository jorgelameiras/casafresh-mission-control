import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AGENTS_BASE = '/Users/jarvis/.openclaw/agents'

interface AgentInfo {
  id: string
  name: string
  color: string
  sessionDir: string
}

const AGENTS: AgentInfo[] = [
  { id: 'jarvis', name: 'Jarvis', color: '#63D866', sessionDir: path.join(AGENTS_BASE, 'jarvis', 'sessions') },
  { id: 'codebot', name: 'CodeBot', color: '#3A7BC8', sessionDir: path.join(AGENTS_BASE, 'codebot', 'sessions') },
  { id: 'reviewbot', name: 'ReviewBot', color: '#B49A60', sessionDir: path.join(AGENTS_BASE, 'reviewbot', 'sessions') },
  { id: 'bizbot', name: 'BizBot', color: '#9AED9C', sessionDir: path.join(AGENTS_BASE, 'bizbot', 'sessions') },
]

function getStatus(lastActiveMs: number | null): 'active' | 'idle' | 'offline' {
  if (!lastActiveMs) return 'offline'
  const diffMs = Date.now() - lastActiveMs
  if (diffMs < 5 * 60 * 1000) return 'active'
  if (diffMs < 30 * 60 * 1000) return 'idle'
  return 'offline'
}

function extractTextFromContent(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, 200)
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block && typeof block === 'object' && 'type' in block && block.type === 'text' && 'text' in block) {
        return String(block.text).slice(0, 200)
      }
    }
  }
  return ''
}

function readLastLines(filePath: string, n: number): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(l => l.trim().length > 0)
    return lines.slice(-n)
  } catch {
    return []
  }
}

function getMostRecentSession(sessionDir: string): { filePath: string; mtime: number } | null {
  try {
    if (!fs.existsSync(sessionDir)) return null
    const files = fs.readdirSync(sessionDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => {
        const fp = path.join(sessionDir, f)
        const stat = fs.statSync(fp)
        return { filePath: fp, mtime: stat.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime)
    return files[0] ?? null
  } catch {
    return null
  }
}

export async function GET() {
  const results = AGENTS.map(agent => {
    const session = getMostRecentSession(agent.sessionDir)
    if (!session) {
      return {
        id: agent.id,
        name: agent.name,
        color: agent.color,
        status: 'offline',
        lastActiveAt: null,
        lastMessage: null,
        sessionFile: null,
      }
    }

    // Read last 5 lines to find the latest assistant message
    const lastLines = readLastLines(session.filePath, 10)
    let lastMessage: string | null = null
    let lastTimestamp: number | null = null

    for (let i = lastLines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lastLines[i])
        // Get timestamp from any entry for recency calculation
        if (lastTimestamp === null && obj.timestamp) {
          lastTimestamp = new Date(obj.timestamp).getTime()
        }
        // Get last assistant text message
        if (lastMessage === null && obj.type === 'message' && obj.message?.role === 'assistant') {
          const text = extractTextFromContent(obj.message.content)
          if (text) lastMessage = text
        }
      } catch {
        // skip malformed lines
      }
    }

    // Use file mtime as fallback for recency
    const lastActiveMs = lastTimestamp ?? session.mtime

    return {
      id: agent.id,
      name: agent.name,
      color: agent.color,
      status: getStatus(lastActiveMs),
      lastActiveAt: lastActiveMs ? new Date(lastActiveMs).toISOString() : null,
      lastMessage: lastMessage,
      sessionFile: path.basename(session.filePath),
    }
  })

  return NextResponse.json({ agents: results, updatedAt: new Date().toISOString() })
}
