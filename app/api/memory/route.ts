import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WORKSPACE_MAIN = '/Users/jarvis/.openclaw/workspace-main'
const MEMORY_DIR = path.join(WORKSPACE_MAIN, 'memory')
const LONG_TERM_MEMORY = path.join(WORKSPACE_MAIN, 'MEMORY.md')
const OVERNIGHT_LOG = path.join(WORKSPACE_MAIN, 'overnight-log.md')

function getTodayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function readFileSafe(filePath: string, maxChars?: number): string | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, 'utf8')
    if (maxChars && content.length > maxChars) {
      return '…' + content.slice(-maxChars)
    }
    return content
  } catch {
    return null
  }
}

function getOvernightLogMtime(): number | null {
  try {
    if (!fs.existsSync(OVERNIGHT_LOG)) return null
    return fs.statSync(OVERNIGHT_LOG).mtimeMs
  } catch {
    return null
  }
}

export async function GET() {
  const todayStr = getTodayDateString()
  const todayFilePath = path.join(MEMORY_DIR, `${todayStr}.md`)

  const todayContent = readFileSafe(todayFilePath)
  const longTermContent = readFileSafe(LONG_TERM_MEMORY, 500)
  const overnightLogMtime = getOvernightLogMtime()

  return NextResponse.json({
    today: {
      date: todayStr,
      content: todayContent,
      exists: todayContent !== null,
    },
    longTerm: {
      content: longTermContent,
      exists: longTermContent !== null,
    },
    overnightLog: {
      mtime: overnightLogMtime,
      mtimeIso: overnightLogMtime ? new Date(overnightLogMtime).toISOString() : null,
    },
    updatedAt: new Date().toISOString(),
  })
}
