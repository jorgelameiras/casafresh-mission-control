import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AGENTS_BASE = '/Users/jarvis/.openclaw/agents'
const AGENT_IDS = ['jarvis', 'codebot', 'reviewbot', 'bizbot']

const AGENT_COLORS: Record<string, string> = {
  jarvis: '#63D866',
  codebot: '#3A7BC8',
  reviewbot: '#B49A60',
  bizbot: '#9AED9C',
}

const AGENT_NAMES: Record<string, string> = {
  jarvis: 'Jarvis',
  codebot: 'CodeBot',
  reviewbot: 'ReviewBot',
  bizbot: 'BizBot',
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

function extractTextFromContent(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, 300)
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block && typeof block === 'object' && 'type' in block && block.type === 'text' && 'text' in block) {
        const text = String(block.text).trim()
        if (text) return text.slice(0, 300)
      }
    }
  }
  return ''
}

function getJsonlFilesModifiedRecently(sessionDir: string, hoursAgo: number): string[] {
  try {
    if (!fs.existsSync(sessionDir)) return []
    const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000
    return fs.readdirSync(sessionDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => path.join(sessionDir, f))
      .filter(fp => {
        try {
          return fs.statSync(fp).mtimeMs > cutoff
        } catch {
          return false
        }
      })
  } catch {
    return []
  }
}

function parseJsonlFile(filePath: string, agentId: string): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  const fileName = path.basename(filePath)
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').filter(l => l.trim().length > 0)

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      try {
        const obj = JSON.parse(lines[lineIdx])

        // Only capture message events with actual content
        if (obj.type !== 'message') continue
        const msg = obj.message
        if (!msg) continue

        const role = msg.role
        // Include both assistant and user messages for richer feed
        if (role !== 'assistant' && role !== 'user') continue

        const text = extractTextFromContent(msg.content)
        if (!text || text.length < 5) continue

        // Skip system-level noise
        if (text.startsWith('HEARTBEAT_OK')) continue
        if (text.startsWith('[') && text.includes('Queued announce')) continue

        // Build a stable, deterministic ID.
        // Prefer the message's own UUID; fall back to a hash of file+line index
        // to avoid React key churn on every poll.
        const stableId = obj.id
          ? `${agentId}-${obj.id}`
          : `${agentId}-${fileName}-${lineIdx}`

        entries.push({
          id: stableId,
          agentId,
          agentName: AGENT_NAMES[agentId] ?? agentId,
          agentColor: AGENT_COLORS[agentId] ?? '#888',
          role,
          content: text,
          timestamp: obj.timestamp ?? new Date().toISOString(),
          model: obj.model ?? undefined,
        })
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // file unreadable
  }
  return entries
}

export async function GET() {
  const allEntries: ActivityEntry[] = []

  for (const agentId of AGENT_IDS) {
    const sessionDir = path.join(AGENTS_BASE, agentId, 'sessions')
    const files = getJsonlFilesModifiedRecently(sessionDir, 24)

    for (const fp of files) {
      const entries = parseJsonlFile(fp, agentId)
      allEntries.push(...entries)
    }
  }

  // Sort by timestamp descending, take last 50
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const top50 = allEntries.slice(0, 50)

  return NextResponse.json({ activity: top50, total: allEntries.length, updatedAt: new Date().toISOString() })
}
