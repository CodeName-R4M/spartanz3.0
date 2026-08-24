// Translation between Postgres snake_case rows and the camelCase domain types
// in lib/types.ts. Keeping this in one file means the rest of the app never
// has to know which storage mode is active.

import type {
  AuditLog,
  ContactMessage,
  EventCategory,
  EventItem,
  Registration,
  SiteSettings,
  TeamCategorySlug,
  TeamMember,
  User,
} from '@/lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function toUser(r: any): User {
  return {
    id: r.id,
    name: r.name ?? '',
    email: r.email,
    avatarUrl: r.avatar_url ?? undefined,
    college: r.college ?? undefined,
    role: r.role === 'admin' ? 'admin' : 'user',
    createdAt: r.created_at,
  }
}

export function toCategory(r: any): EventCategory {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    active: r.active,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function fromCategory(c: EventCategory) {
  return {
    name: c.name,
    slug: c.slug,
    active: c.active,
    display_order: c.displayOrder,
    updated_at: new Date().toISOString(),
  }
}

export function toEvent(r: any): EventItem {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    shortDescription: r.short_description ?? '',
    description: r.description ?? '',
    rules: r.rules ?? [],
    image: r.image ?? '',
    gif: r.gif ?? undefined,
    date: r.date ?? '',
    startTime: r.start_time ?? '',
    endTime: r.end_time ?? '',
    venue: r.venue ?? '',
    teamSize: { min: r.team_size_min ?? 1, max: r.team_size_max ?? 1 },
    registrationFee: r.registration_fee ?? 0,
    prizes: r.prizes ?? '',
    coordinator: {
      name: r.coordinator_name ?? '',
      phone: r.coordinator_phone ?? '',
    },
    status: r.status === 'disabled' ? 'disabled' : 'active',
    featured: r.featured ?? false,
    displayOrder: r.display_order ?? 99,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function fromEvent(e: EventItem) {
  return {
    name: e.name,
    slug: e.slug,
    category: e.category,
    short_description: e.shortDescription,
    description: e.description,
    rules: e.rules,
    image: e.image,
    gif: e.gif ?? null,
    date: e.date || null,
    start_time: e.startTime,
    end_time: e.endTime,
    venue: e.venue,
    team_size_min: e.teamSize.min,
    team_size_max: e.teamSize.max,
    registration_fee: e.registrationFee,
    prizes: e.prizes,
    coordinator_name: e.coordinator.name,
    coordinator_phone: e.coordinator.phone,
    status: e.status,
    featured: e.featured ?? false,
    display_order: e.displayOrder,
    updated_at: new Date().toISOString(),
  }
}

export function toRegistration(r: any): Registration {
  return {
    id: r.id,
    userId: r.user_id,
    eventId: r.event_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    college: r.college,
    department: r.department,
    year: r.year,
    teamName: r.team_name ?? undefined,
    members: (r.registration_members ?? []).map((m: any) => ({
      name: m.name,
      email: m.email ?? undefined,
    })),
    status: r.status,
    createdAt: r.created_at,
  }
}

export function toTeamMember(r: any): TeamMember {
  return {
    id: r.id,
    name: r.name,
    role: r.role ?? '',
    category: r.category as TeamCategorySlug,
    photo: r.photo ?? '',
    shortBio: r.short_bio ?? undefined,
    department: r.department ?? undefined,
    year: r.year ?? undefined,
    displayOrder: r.display_order ?? 99,
    active: r.active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function fromTeamMember(m: TeamMember) {
  return {
    name: m.name,
    role: m.role,
    category: m.category,
    photo: m.photo,
    short_bio: m.shortBio ?? null,
    department: m.department ?? null,
    year: m.year ?? null,
    display_order: m.displayOrder,
    active: m.active,
    updated_at: new Date().toISOString(),
  }
}

export function toMessage(r: any): ContactMessage {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    read: r.read,
    createdAt: r.created_at,
  }
}

export function toAudit(r: any): AuditLog {
  return {
    id: r.id,
    actorEmail: r.actor_email,
    action: r.action,
    target: r.target ?? '',
    createdAt: r.created_at,
  }
}

export function toSettings(r: any): SiteSettings {
  return {
    symposiumName: r.symposium_name,
    subtitle: r.subtitle,
    college: r.college,
    department: r.department,
    club: r.club,
    theme: r.theme,
    date: r.date ?? '',
    venue: r.venue ?? '',
    contactEmail: r.contact_email ?? '',
    phone: r.phone ?? '',
    socials: r.socials ?? [],
    heroTagline: r.hero_tagline ?? '',
    heroSubline: r.hero_subline ?? undefined,
    countdownDate: r.countdown_date ?? '',
    registrationOpen: r.registration_open,
  }
}

export function fromSettings(s: SiteSettings) {
  return {
    symposium_name: s.symposiumName,
    subtitle: s.subtitle,
    college: s.college,
    department: s.department,
    club: s.club,
    theme: s.theme,
    date: s.date,
    venue: s.venue,
    contact_email: s.contactEmail,
    phone: s.phone,
    socials: s.socials,
    hero_tagline: s.heroTagline,
    hero_subline: s.heroSubline ?? null,
    countdown_date: s.countdownDate,
    registration_open: s.registrationOpen,
    updated_at: new Date().toISOString(),
  }
}
