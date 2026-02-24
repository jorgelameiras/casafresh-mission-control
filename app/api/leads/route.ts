import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Lead } from '@/lib/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'leads.json')

function readLeads(): Lead[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeLeads(leads: Lead[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8')
}

export async function GET() {
  const leads = readLeads()
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const leads = readLeads()

    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: body.name ?? '',
      email: body.email ?? '',
      source: body.source ?? 'other',
      status: body.status ?? 'new',
      estimatedValue: body.estimatedValue ?? 0,
      setupType: body.setupType ?? 'basic',
      notes: body.notes ?? '',
      lastContactDate: body.lastContactDate ?? null,
      nextFollowUpDate: body.nextFollowUpDate ?? null,
      actualRevenue: body.actualRevenue ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
    }

    leads.push(newLead)
    writeLeads(leads)

    return NextResponse.json(newLead, { status: 201 })
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

    const leads = readLeads()
    const idx = leads.findIndex(l => l.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const wasNotClosed = !leads[idx].closedAt
    const isNowClosed = updates.status === 'closed_won' || updates.status === 'closed_lost'

    leads[idx] = {
      ...leads[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
      closedAt: wasNotClosed && isNowClosed ? new Date().toISOString() : leads[idx].closedAt,
    }

    writeLeads(leads)
    return NextResponse.json(leads[idx])
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const leads = readLeads()
    const idx = leads.findIndex(l => l.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    leads.splice(idx, 1)
    writeLeads(leads)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
