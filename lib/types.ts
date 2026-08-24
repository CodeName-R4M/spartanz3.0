export type Role = "user" | "admin"

export type RegistrationStatus = "REGISTERED" | "CONFIRMED" | "CANCELLED" | "ATTENDED"

export type EventStatus = "active" | "draft" | "closed"

export interface AppUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  college: string | null
  department: string | null
  year: string | null
  role: Role
  created_at: string
  registration_count?: number
}

export interface EventCategory {
  id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  display_order: number
  created_at?: string
  event_count?: number
}

export interface SymposiumEvent {
  id: string
  name: string
  slug: string
  category_id: string | null
  category_name: string | null
  category_slug: string | null
  short_description: string
  description: string
  rules: string[]
  image_url: string | null
  gif_url: string | null
  event_date: string
  start_time: string
  end_time: string
  venue: string
  min_team_size: number
  max_team_size: number
  registration_fee: number
  prizes: string
  coordinator_name: string
  coordinator_phone: string
  status: EventStatus
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
  registration_count?: number
}

export interface RegistrationMember {
  id?: string
  name: string
  email?: string | null
  phone?: string | null
}

export interface Registration {
  id: string
  reference_code: string
  user_id: string
  event_id: string
  full_name: string
  email: string
  phone: string
  college: string
  department: string
  year: string
  team_name: string | null
  status: RegistrationStatus
  created_at: string
  event_name?: string
  event_category?: string
  members?: RegistrationMember[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  category: string
  photo_url: string | null
  short_bio: string | null
  department: string | null
  year: string | null
  display_order: number
  active: boolean
  created_at?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  handled: boolean
  created_at: string
}

export interface SiteSettings {
  id: string
  symposium_name: string
  subtitle: string
  college_name: string
  department_name: string
  club_name: string
  event_date: string
  venue: string
  contact_email: string
  contact_phone: string
  instagram_url: string | null
  linkedin_url: string | null
  github_url: string | null
  youtube_url: string | null
  hero_headline: string
  hero_subline: string
  countdown_target: string
  registration_open: boolean
  updated_at?: string
}

export interface AuditLog {
  id: string
  actor_email: string
  action: string
  target: string | null
  details: string | null
  created_at: string
}
