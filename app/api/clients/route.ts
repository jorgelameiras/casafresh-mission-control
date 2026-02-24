import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Client } from '@/lib/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'clients.json')

function readClients(): Client[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeClients(clients: Client[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), 'utf-8')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let clients = readClients()

  if (status) {
    const statuses = status.split(',')
    clients = clients.filter(c => statuses.includes(c.status))
  }

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const clients = readClients()

    const newClient: Client = {
      id: crypto.randomUUID(),
      name: body.name ?? '',
      company: body.company ?? '',
      type: body.type ?? 'property_manager',
      email: body.email ?? '',
      phone: body.phone ?? '',
      website: body.website ?? '',
      location: body.location ?? '',
      status: body.status ?? 'lead',
      priority: body.priority ?? 'medium',
      notes: body.notes ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    clients.push(newClient)
    writeClients(clients)

    return NextResponse.json(newClient, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
