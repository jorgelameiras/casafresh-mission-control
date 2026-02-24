import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Job } from '@/lib/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'jobs.json')

function readJobs(): Job[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeJobs(jobs: Job[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), 'utf-8')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const propertyId = searchParams.get('propertyId')

  let jobs = readJobs()

  if (status) {
    const statuses = status.split(',')
    jobs = jobs.filter(j => statuses.includes(j.status))
  }
  if (type) {
    jobs = jobs.filter(j => j.type === type)
  }
  if (propertyId) {
    jobs = jobs.filter(j => j.propertyId === propertyId)
  }

  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const jobs = readJobs()

    const newJob: Job = {
      id: crypto.randomUUID(),
      propertyId: body.propertyId ?? '',
      propertyName: body.propertyName ?? '',
      clientName: body.clientName ?? '',
      type: body.type ?? 'cleaning',
      status: body.status ?? 'scheduled',
      scheduledDate: body.scheduledDate ?? '',
      scheduledTime: body.scheduledTime ?? '',
      assignedTo: body.assignedTo ?? '',
      notes: body.notes ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    }

    jobs.push(newJob)
    writeJobs(jobs)

    return NextResponse.json(newJob, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const jobs = readJobs()
    const idx = jobs.findIndex(j => j.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const isCompleting = updates.status === 'completed' && jobs[idx].status !== 'completed'

    jobs[idx] = {
      ...jobs[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
      completedAt: isCompleting ? new Date().toISOString() : jobs[idx].completedAt,
    }

    writeJobs(jobs)
    return NextResponse.json(jobs[idx])
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
