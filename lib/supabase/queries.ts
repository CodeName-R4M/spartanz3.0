import 'server-only'

// Supabase read-side queries. These are the Postgres counterparts of the
// functions in lib/data.ts, which picks between this file and the local JSON
// store depending on whether credentials are configured.
//
// Reads that must ignore RLS (admin listings of every user/registration) go
// through the service-role client and are only ever called behind
// requireAdmin(). Everything else uses the request-scoped client so the
// policies in scripts/002_rls.sql apply.

import { createAdminClient, createClient } from './server'
import {
  toAudit,
  toCategory,
  toEvent,
  toMessage,
  toRegistration,
  toSettings,
  toTeamMember,
  toUser,
} from './mappers'
import { SEED_SETTINGS } from '@/lib/seed'

export async function sbFetchSettings() {
  const sb = await createClient()
  const { data, error } = await sb
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  return data ? toSettings(data) : SEED_SETTINGS
}

export async function sbFetchEvents(opts?: { activeOnly?: boolean }) {
  const sb = await createClient()
  let q = sb.from('events').select('*').order('display_order')
  if (opts?.activeOnly) q = q.eq('status', 'active')
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toEvent)
}

export async function sbFetchEventBySlug(slug: string) {
  const sb = await createClient()
  const { data, error } = await sb
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? toEvent(data) : null
}

export async function sbFetchCategories(opts?: { activeOnly?: boolean }) {
  const sb = await createClient()
  let q = sb.from('event_categories').select('*').order('display_order')
  if (opts?.activeOnly) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toCategory)
}

export async function sbFetchTeam(opts?: { activeOnly?: boolean }) {
  const sb = await createClient()
  let q = sb.from('team_members').select('*').order('display_order')
  if (opts?.activeOnly) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(toTeamMember)
}

const REG_SELECT = '*, registration_members ( name, email )'

/** Admin-only: every registration in the system. */
export async function sbFetchRegistrations() {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('registrations')
    .select(REG_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toRegistration)
}

/** The signed-in participant's own registrations. */
export async function sbFetchMyRegistrations(userId: string) {
  const sb = await createClient()
  const { data, error } = await sb
    .from('registrations')
    .select(REG_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toRegistration)
}

/** Admin-only. */
export async function sbFetchUsers() {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toUser)
}

/** Admin-only. */
export async function sbFetchMessages() {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toMessage)
}

/** Admin-only. */
export async function sbFetchAudit() {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []).map(toAudit)
}
