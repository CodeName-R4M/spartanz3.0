import 'server-only'
import { isSupabaseEnabled } from '@/lib/supabase/config'
import type {
  ContactMessage,
  EventCategory,
  EventItem,
  Registration,
  SiteSettings,
  TeamMember,
  User,
} from './types'
import {
  getCategories as storeCategories,
  getEvents as storeEvents,
  getMessages as storeMessages,
  getRegistrations as storeRegistrations,
  getSettings as storeSettings,
  getTeam as storeTeam,
  getUsers as storeUsers,
} from './store'

async function sbOrFallback<T>(
  sbFn: () => Promise<T>,
  fallback: () => Promise<T> | T,
): Promise<T> {
  if (!isSupabaseEnabled()) return fallback() as T
  try {
    return await sbFn()
  } catch {
    return fallback() as T
  }
}

export async function fetchSettings(): Promise<SiteSettings> {
  return sbOrFallback(
    async () => {
      const { sbFetchSettings } = await import('./supabase/queries')
      return sbFetchSettings()
    },
    () => storeSettings(),
  )
}

export async function fetchEvents(opts?: {
  activeOnly?: boolean
  categorySlug?: string
  featuredOnly?: boolean
}): Promise<EventItem[]> {
  const list = await sbOrFallback(
    async () => {
      const { sbFetchEvents } = await import('./supabase/queries')
      return sbFetchEvents({ activeOnly: opts?.activeOnly })
    },
    async () => {
      let l = await storeEvents()
      if (opts?.activeOnly) l = l.filter((e) => e.status === 'active')
      return l
    },
  )
  let result = list
  if (opts?.categorySlug) result = result.filter((e) => e.category === opts.categorySlug)
  if (opts?.featuredOnly) result = result.filter((e) => e.featured)
  return result
}

export async function fetchEventBySlug(slug: string): Promise<EventItem | null> {
  return sbOrFallback(
    async () => {
      const { sbFetchEventBySlug } = await import('./supabase/queries')
      return sbFetchEventBySlug(slug)
    },
    async () => {
      const all = await storeEvents()
      return all.find((e) => e.slug === slug) ?? null
    },
  )
}

export async function fetchCategories(opts?: {
  activeOnly?: boolean
}): Promise<EventCategory[]> {
  const list = await sbOrFallback(
    async () => {
      const { sbFetchCategories } = await import('./supabase/queries')
      return sbFetchCategories({ activeOnly: opts?.activeOnly })
    },
    storeCategories,
  )
  if (opts?.activeOnly) return list.filter((c) => c.active)
  return list
}

export async function fetchTeam(opts?: {
  activeOnly?: boolean
}): Promise<TeamMember[]> {
  const list = await sbOrFallback(
    async () => {
      const { sbFetchTeam } = await import('./supabase/queries')
      return sbFetchTeam({ activeOnly: opts?.activeOnly })
    },
    storeTeam,
  )
  if (opts?.activeOnly) return list.filter((m) => m.active)
  return list
}

export async function fetchRegistrations(): Promise<Registration[]> {
  return sbOrFallback(
    async () => {
      const { sbFetchRegistrations } = await import('./supabase/queries')
      return sbFetchRegistrations()
    },
    storeRegistrations,
  )
}

export async function fetchMyRegistrations(userId: string): Promise<Registration[]> {
  const all = await sbOrFallback(
    async () => {
      const { sbFetchMyRegistrations } = await import('./supabase/queries')
      return sbFetchMyRegistrations(userId)
    },
    storeRegistrations,
  )
  if (isSupabaseEnabled()) return all
  return all.filter((r) => r.userId === userId)
}

export async function fetchUsers(): Promise<User[]> {
  return sbOrFallback(
    async () => {
      const { sbFetchUsers } = await import('./supabase/queries')
      return sbFetchUsers()
    },
    storeUsers,
  )
}

export async function fetchMessages(): Promise<ContactMessage[]> {
  return sbOrFallback(
    async () => {
      const { sbFetchMessages } = await import('./supabase/queries')
      return sbFetchMessages()
    },
    storeMessages,
  )
}

export async function fetchPublicStats() {
  const events = await fetchEvents({ activeOnly: true })
  const registrations = await fetchRegistrations()
  const team = await fetchTeam({ activeOnly: true })
  return {
    events: events.length,
    registrations: registrations.filter((r) => r.status !== 'cancelled').length,
    teamMembers: team.length,
    colleges: 24,
  }
}
