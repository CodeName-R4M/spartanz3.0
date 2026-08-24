// ---------------------------------------------------------------------------
// SPARTANZ 3.0 — domain types.
//
// These are the camelCase shapes the whole app speaks. Postgres rows are
// snake_case; lib/supabase/mappers.ts is the only place that translates between
// the two, so no page, component or action ever has to know which storage mode
// (Supabase or the local JSON store) is active.
// ---------------------------------------------------------------------------

export type Role = 'user' | 'admin'

/** Lifecycle of a participant's registration. Lowercase to match the DB enum. */
export const REGISTRATION_STATUSES = [
  'registered',
  'confirmed',
  'attended',
  'cancelled',
] as const

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

/** An event is either open for registration or hidden from the public site. */
export type EventStatus = 'active' | 'disabled'

/** The fixed groups the team page renders, in display order. */
export const TEAM_CATEGORIES = [
  { slug: 'faculty-coordinators', label: 'Faculty Coordinators' },
  { slug: 'organizing-committee', label: 'Organizing Committee' },
  { slug: 'event-coordinators', label: 'Event Coordinators' },
  { slug: 'technical-team', label: 'Technical Team' },
  { slug: 'design-team', label: 'Design Team' },
  { slug: 'media-team', label: 'Media Team' },
  { slug: 'hospitality-team', label: 'Hospitality Team' },
  { slug: 'registration-team', label: 'Registration Team' },
] as const

export type TeamCategorySlug = (typeof TEAM_CATEGORIES)[number]['slug']

export const YEARS = [
  'First Year',
  'Second Year',
  'Third Year',
  'Final Year',
  'PG / Other',
] as const

// ------------------------------- users -------------------------------------
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  phone?: string
  college?: string
  department?: string
  year?: string
  role: Role
  createdAt: string
}

// ----------------------------- categories ----------------------------------
export interface EventCategory {
  id: string
  name: string
  slug: string
  active: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ------------------------------- events ------------------------------------
export interface TeamSize {
  min: number
  max: number
}

export interface EventCoordinator {
  name: string
  phone: string
}

export interface EventItem {
  id: string
  name: string
  slug: string
  /** Matches EventCategory.slug. */
  category: string
  shortDescription: string
  description: string
  rules: string[]
  image: string
  gif?: string
  /** Human-readable date shown on cards, e.g. "March 14, 2026". */
  date: string
  startTime: string
  endTime: string
  venue: string
  teamSize: TeamSize
  registrationFee: number
  prizes: string
  coordinator: EventCoordinator
  status: EventStatus
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ---------------------------- registrations --------------------------------
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

// ------------------------------ team roster --------------------------------
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

// ------------------------------- messages ----------------------------------
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

// -------------------------------- audit ------------------------------------
export interface AuditLog {
  id: string
  actorEmail: string
  action: string
  target: string
  createdAt: string
}

// ------------------------------- settings ----------------------------------
export interface SocialLink {
  label: string
  url: string
}

export interface SiteSettings {
  symposiumName: string
  subtitle: string
  college: string
  department: string
  club: string
  theme: string
  /** Display date, e.g. "March 14, 2026". */
  date: string
  venue: string
  contactEmail: string
  phone: string
  socials: SocialLink[]
  heroTagline: string
  /** ISO timestamp the hero countdown ticks down to. */
  countdownDate: string
  registrationOpen: boolean
}
