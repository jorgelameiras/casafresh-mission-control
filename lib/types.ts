// ── CRM Types ──

export type ClientStatus = 'lead' | 'prospect' | 'active' | 'inactive'
export type ClientPriority = 'high' | 'medium' | 'low'
export type ClientType = 'property_manager' | 'property_owner' | 'hoa'

export interface Client {
  id: string
  name: string
  company: string
  type: ClientType
  email: string
  phone: string
  website: string
  location: string
  status: ClientStatus
  priority: ClientPriority
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  clientId: string
  address: string
  city: string
  type: 'vacation_home' | 'condo' | 'villa' | 'townhouse'
  bedrooms: number
  lastClean: string | null
  lastACService: string | null
  notes: string
}

// ── Lead Tracker Types ──

export type LeadSource = 'upwork' | 'twitter' | 'discord' | 'reddit' | 'referral' | 'website' | 'cold_call' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'call_booked' | 'proposal_sent' | 'closed_won' | 'closed_lost'
export type SetupType = 'basic' | 'business' | 'enterprise'

export interface Lead {
  id: string
  name: string
  email: string
  source: LeadSource
  status: LeadStatus
  estimatedValue: number
  setupType: SetupType
  notes: string
  lastContactDate: string | null
  nextFollowUpDate: string | null
  actualRevenue: number
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

// ── Job Scheduler Types ──

export type JobType = 'cleaning' | 'ac_maintenance'
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface Job {
  id: string
  propertyId: string
  propertyName: string
  clientName: string
  type: JobType
  status: JobStatus
  scheduledDate: string
  scheduledTime: string
  assignedTo: string
  notes: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
