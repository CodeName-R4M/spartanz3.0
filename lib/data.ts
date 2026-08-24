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

// ---------------------------------------------------------------------------
// Read-side data access. Pages and layouts call these functions only.
//
// >>> SUPABASE SWAP POINT <<<
// When NEXT_PUBLIC_USE_SUPABASE=true and real credentials are set, reimplement
// each function here with a Supabase query (e.g.
// `supabase.from('events').select('*')`). Keep the return shapes identical and
// every page/component keeps working with zero changes elsewhere.
// ---------------------------------------------------------------------------

export async function fetchSettings() {
  return getSettings()
}

export async function fetchEvents(opts?: { activeOnly?: boolean }) {
  const events = await getEvents()
  return opts?.activeOnly
    ? events.filter((e) => e.status === 'active')
    : events
}

export async function fetchEventBySlug(slug: string) {
  const events = await getEvents()
  return events.find((e) => e.slug === slug) ?? null
}

export async function fetchCategories(opts?: { activeOnly?: boolean }) {
  const cats = await getCategories()
  return opts?.activeOnly ? cats.filter((c) => c.active) : cats
}

export async function fetchTeam(opts?: { activeOnly?: boolean }) {
  const team = await getTeam()
  return opts?.activeOnly ? team.filter((t) => t.active) : team
}

export async function fetchRegistrations() {
  return getRegistrations()
}

export async function fetchUsers() {
  return getUsers()
}

export async function fetchMessages() {
  return getMessages()
}

export async function fetchAudit() {
  return getAudit()
}
