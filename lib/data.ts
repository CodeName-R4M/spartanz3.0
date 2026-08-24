import 'server-only'
import {
  getAudit,
  getCategories,
  getEvents,
  getMessages,
  getRegistrations,
  getSettings,
  getTeam,
  getUsers,
} from './store'
import { isSupabaseEnabled } from './supabase/config'

// ---------------------------------------------------------------------------
// Read-side data access. Pages and layouts call ONLY these functions, which
// means the storage backend can change without touching a single component.
//
// Two modes, chosen automatically:
//
//   * Supabase   — active as soon as NEXT_PUBLIC_SUPABASE_URL and
//                  NEXT_PUBLIC_SUPABASE_ANON_KEY are set. Delegates to
//                  lib/supabase/queries.ts.
//   * Local JSON — the fallback, so the site is fully functional before any
//                  credentials exist.
//
// The Supabase modules are imported lazily so the local mode never pulls in
// the client or throws on missing configuration.
// ---------------------------------------------------------------------------

export async function fetchSettings() {
  if (isSupabaseEnabled()) {
    const { sbFetchSettings } = await import('./supabase/queries')
    return sbFetchSettings()
  }
  return getSettings()
}

export async function fetchEvents(opts?: { activeOnly?: boolean }) {
  if (isSupabaseEnabled()) {
    const { sbFetchEvents } = await import('./supabase/queries')
    return sbFetchEvents(opts)
  }
  const events = await getEvents()
  return opts?.activeOnly ? events.filter((e) => e.status === 'active') : events
}

export async function fetchEventBySlug(slug: string) {
  if (isSupabaseEnabled()) {
    const { sbFetchEventBySlug } = await import('./supabase/queries')
    return sbFetchEventBySlug(slug)
  }
  const events = await getEvents()
  return events.find((e) => e.slug === slug) ?? null
}

export async function fetchCategories(opts?: { activeOnly?: boolean }) {
  if (isSupabaseEnabled()) {
    const { sbFetchCategories } = await import('./supabase/queries')
    return sbFetchCategories(opts)
  }
  const cats = await getCategories()
  return opts?.activeOnly ? cats.filter((c) => c.active) : cats
}

export async function fetchTeam(opts?: { activeOnly?: boolean }) {
  if (isSupabaseEnabled()) {
    const { sbFetchTeam } = await import('./supabase/queries')
    return sbFetchTeam(opts)
  }
  const team = await getTeam()
  return opts?.activeOnly ? team.filter((t) => t.active) : team
}

export async function fetchRegistrations() {
  if (isSupabaseEnabled()) {
    const { sbFetchRegistrations } = await import('./supabase/queries')
    return sbFetchRegistrations()
  }
  return getRegistrations()
}

export async function fetchMyRegistrations(userId: string) {
  if (isSupabaseEnabled()) {
    const { sbFetchMyRegistrations } = await import('./supabase/queries')
    return sbFetchMyRegistrations(userId)
  }
  const regs = await getRegistrations()
  return regs.filter((r) => r.userId === userId)
}

export async function fetchUsers() {
  if (isSupabaseEnabled()) {
    const { sbFetchUsers } = await import('./supabase/queries')
    return sbFetchUsers()
  }
  return getUsers()
}

export async function fetchMessages() {
  if (isSupabaseEnabled()) {
    const { sbFetchMessages } = await import('./supabase/queries')
    return sbFetchMessages()
  }
  return getMessages()
}

export async function fetchAudit() {
  if (isSupabaseEnabled()) {
    const { sbFetchAudit } = await import('./supabase/queries')
    return sbFetchAudit()
  }
  return getAudit()
}
