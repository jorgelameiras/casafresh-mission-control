import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Property } from '@/lib/types'

const DATA_FILE = path.join(process.cwd(), 'data', 'properties.json')

function readProperties(): Property[] {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeProperties(properties: Property[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2), 'utf-8')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')

  let properties = readProperties()

  if (clientId) {
    properties = properties.filter(p => p.clientId === clientId)
  }

  return NextResponse.json(properties)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const properties = readProperties()

    const newProperty: Property = {
      id: crypto.randomUUID(),
      clientId: body.clientId ?? '',
      address: body.address ?? '',
      city: body.city ?? '',
      type: body.type ?? 'vacation_home',
      bedrooms: body.bedrooms ?? 0,
      lastClean: body.lastClean ?? null,
      lastACService: body.lastACService ?? null,
      notes: body.notes ?? '',
    }

    properties.push(newProperty)
    writeProperties(properties)

    return NextResponse.json(newProperty, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
