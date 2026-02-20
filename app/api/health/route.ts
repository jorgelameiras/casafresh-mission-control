import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DiskInfo {
  total: string
  used: string
  available: string
  usePercent: string
}

interface MemoryInfo {
  freeGB: string
  usedGB: string
  totalGB: string
  usedPercent: number
}

function getDiskInfo(): DiskInfo | null {
  try {
    const output = execSync('df -h /', { timeout: 3000 }).toString()
    const lines = output.trim().split('\n')
    // Skip header line
    if (lines.length < 2) return null
    const parts = lines[1].split(/\s+/)
    // df -h / output on macOS: Filesystem Size Used Avail Capacity iused ifree %iused Mounted
    // On Linux: Filesystem Size Used Avail Use% Mounted
    return {
      total: parts[1] ?? '?',
      used: parts[2] ?? '?',
      available: parts[3] ?? '?',
      usePercent: parts[4] ?? '?',
    }
  } catch {
    return null
  }
}

function getMemoryInfo(): MemoryInfo | null {
  try {
    const output = execSync('vm_stat', { timeout: 3000 }).toString()
    const lines = output.split('\n')

    // Parse page size
    const pageSizeMatch = output.match(/page size of (\d+) bytes/)
    const pageSize = pageSizeMatch ? parseInt(pageSizeMatch[1]) : 4096

    const getValue = (key: string): number => {
      const line = lines.find(l => l.includes(key))
      if (!line) return 0
      const match = line.match(/(\d+)/)
      return match ? parseInt(match[1]) * pageSize : 0
    }

    const free = getValue('Pages free')
    const inactive = getValue('Pages inactive')
    const speculative = getValue('Pages speculative')
    const active = getValue('Pages active')
    const wired = getValue('Pages wired down')
    const compressed = getValue('Pages occupied by compressor')

    const freeBytes = free + inactive + speculative
    const usedBytes = active + wired + compressed
    const totalBytes = freeBytes + usedBytes

    const toGB = (b: number) => (b / 1024 / 1024 / 1024).toFixed(1)

    return {
      freeGB: toGB(freeBytes),
      usedGB: toGB(usedBytes),
      totalGB: toGB(totalBytes),
      usedPercent: Math.round((usedBytes / totalBytes) * 100),
    }
  } catch {
    return null
  }
}

function getUptime(): string | null {
  try {
    const output = execSync('uptime', { timeout: 3000 }).toString().trim()

    // macOS: "23:47  up 3 days,  2:05, 2 users, load averages: 1.23 0.45 0.38"
    // Try to extract the "up X" portion
    const upMatch = output.match(/up\s+(.+?)(?:,\s+\d+\s+user|,\s+load)/)
    if (upMatch) return upMatch[1].trim()

    // Fallback: return trimmed output
    return output.slice(0, 60)
  } catch {
    return null
  }
}

async function checkService(url: string, timeoutMs = 2000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok || res.status < 500
  } catch {
    return false
  }
}

export async function GET() {
  const [disk, memory, uptime, gatewayOk, ollamaOk] = await Promise.all([
    Promise.resolve(getDiskInfo()),
    Promise.resolve(getMemoryInfo()),
    Promise.resolve(getUptime()),
    checkService('http://127.0.0.1:18789'),
    checkService('http://127.0.0.1:11434'),
  ])

  return NextResponse.json({
    disk,
    memory,
    uptime,
    services: {
      gateway: gatewayOk,
      ollama: ollamaOk,
    },
    updatedAt: new Date().toISOString(),
  })
}
