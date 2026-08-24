// Domain types for SPARTANZ 3.0. These mirror the intended Supabase schema
// (tables: users, events, event_categories, registrations,
// registration_members, team_members, contact_messages,
// admin_audit_logs, site_settings) so swapping in Supabase is a drop-in.

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  college?: string
  role: UserRole
  createdAt: string
}

export type EventCategorySlug = string

export interface EventCategory {
  id: string
  name: string
  slug: EventCategorySlug
  active: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type EventStatus = 'active' | 'disabled'

export interface EventItem {
  id: string
  name: string
  slug: string
  category: EventCategorySlug
  shortDescription: string
  description: string
  rules: string[]
  image: string
  gif?: string
  date: string
  startTime: string
  endTime: string
  venue: string
  teamSize: { min: number; max: number }
  registrationFee: number
  prizes: string
  coordinator: { name: string; phone: string }
  status: EventStatus
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type RegistrationStatus =
  | 'registered'
  | 'confirmed'
  | 'cancelled'
  | 'attended'

export interface RegistrationMember {
  name: string
  email?: string
}

export interface Registration {
  id: string
  userId: string
  eventId: string
  fullName: string
  email: string
  phone: string
  college: string
  department: string
  year: string
  teamName?: string
  members: RegistrationMember[]
  status: RegistrationStatus
  createdAt: string
}

export type TeamCategorySlug =
  | 'faculty-coordinators'
  | 'organizing-committee'
  | 'event-coordinators'
  | 'technical-team'
  | 'design-team'
  | 'media-team'
  | 'hospitality-team'
  | 'registration-team'

export interface TeamMember {
  id: string
  name: string
  role: string
  category: TeamCategorySlug
  photo: string
  shortBio?: string
  department?: string
  year?: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  read: boolean
}

export interface AuditLog {
  id: string
  actorEmail: string
  action: string
  target: string
  createdAt: string
}

export interface SiteSettings {
  symposiumName: string
  subtitle: string
  college: string
  department: string
  club: string
  theme: string
  date: string
  venue: string
  contactEmail: string
  phone: string
  socials: { label: string; url: string }[]
  heroTagline: string
  countdownDate: string
  registrationOpen: boolean
}

export const TEAM_CATEGORIES: { slug: TeamCategorySlug; label: string }[] = [
  { slug: 'faculty-coordinators', label: 'Faculty Coordinators' },
  { slug: 'organizing-committee', label: 'Organizing Committee' },
  { slug: 'event-coordinators', label: 'Event Coordinators' },
  { slug: 'technical-team', label: 'Technical Team' },
  { slug: 'design-team', label: 'Design Team' },
  { slug: 'media-team', label: 'Media Team' },
  { slug: 'hospitality-team', label: 'Hospitality Team' },
  { slug: 'registration-team', label: 'Registration Team' },
]

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  'registered',
  'confirmed',
  'cancelled',
  'attended',
]
