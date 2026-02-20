import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WORKSPACE_MAIN = '/Users/jarvis/.openclaw/workspace-main'
const WORKSPACE_BUSINESS = '/Users/jarvis/.openclaw/workspace-business'

function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function countLeads(content: string | null): number {
  if (!content) return 0
  // Count summary line "Total Leads Found: N" first
  const totalMatch = content.match(/Total Leads Found[:\s]+(\d+)/i)
  if (totalMatch) return parseInt(totalMatch[1], 10)
  const matches = content.match(/^##\s+Lead/gm)
  return matches ? matches.length : 0
}

function countProperties(content: string | null): number {
  if (!content) return 0
  const matches = content.match(/^##\s+/gm)
  return matches ? matches.length : 0
}

function countIdeas(content: string | null): number {
  if (!content) return 0
  const hashMatches = content.match(/^#{2,3}\s+/gm)
  if (hashMatches && hashMatches.length > 0) return hashMatches.length
  const dashMatches = content.match(/^[-*]\s+/gm)
  return dashMatches ? dashMatches.length : 0
}

function getLastLogEntry(content: string | null): string | null {
  if (!content) return null
  // Find last ## heading using exec loop (avoids TS spread issue with matchAll)
  const re = /^##\s+(.+)/gm
  let last: string | null = null
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    last = m[1].trim()
  }
  return last
}

function countMemoryFiles(): number {
  try {
    const memDir = path.join(WORKSPACE_MAIN, 'memory')
    if (!fs.existsSync(memDir)) return 0
    return fs.readdirSync(memDir).filter(f => f.endsWith('.md')).length
  } catch {
    return 0
  }
}

export async function GET() {
  const leadsContent = readFileSafe(path.join(WORKSPACE_BUSINESS, 'leads.md'))
  const propertiesContent = readFileSafe(path.join(WORKSPACE_MAIN, 'properties.md'))
  const ideasContent = readFileSafe(path.join(WORKSPACE_MAIN, 'ideas.md'))
  const businessLogContent = readFileSafe(path.join(WORKSPACE_MAIN, 'business-log.md'))

  const leadsCount = countLeads(leadsContent)
  const propertiesCount = countProperties(propertiesContent)
  const ideasCount = countIdeas(ideasContent)
  const memoryFiles = countMemoryFiles()
  const lastLogEntry = getLastLogEntry(businessLogContent)

  return NextResponse.json({
    leads: leadsCount,
    properties: propertiesCount,
    ideas: ideasCount,
    memoryFiles,
    lastLogEntry,
    updatedAt: new Date().toISOString(),
  })
}
