import 'server-only'

// Supabase write-side operations, the Postgres counterparts of the writes in
// lib/store.ts. Every function here is called only from a server action that
// has already run requireAdmin() or requireUser().
//
// Admin CRUD uses the service-role client so we get clear error messages
// instead of silent RLS row-count-zero results; the policies in
// scripts/002_rls.sql remain the backstop for anything hitting the DB directly.

import { createAdminClient, createClient } from './server'
import {
  fromCategory,
  fromEvent,
  fromSettings,
  fromTeamMember,
  toCategory,
  toEvent,
  toTeamMember,
} from './mappers'
import type {
  EventCategory,
  EventItem,
  RegistrationMember,
  RegistrationStatus,
  SiteSettings,
  TeamMember,
} from '@/lib/types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Local-mode ids look like "ev-abc-123", which Postgres would reject. */
function realId(id?: string): string | null {
  return id && UUID_RE.test(id) ? id : null
}

// ------------------------------- events ------------------------------------
export async function sbUpsertEvent(event: EventItem) {
  const sb = createAdminClient()
  const row = fromEvent(event)
  const id = realId(event.id)

  const { data, error } = id
    ? await sb.from('events').update(row).eq('id', id).select('*').single()
    : await sb.from('events').insert(row).select('*').single()

  if (error) throw new Error(error.message)
  return toEvent(data)
}

export async function sbDeleteEvent(id: string) {
  const sb = createAdminClient()
  const { error } = await sb.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ----------------------------- categories ----------------------------------
export async function sbUpsertCategory(cat: EventCategory) {
  const sb = createAdminClient()
  const row = fromCategory(cat)
  const id = realId(cat.id)

  const { data, error } = id
    ? await sb.from('event_categories').update(row).eq('id', id).select('*').single()
    : await sb.from('event_categories').insert(row).select('*').single()

  if (error) throw new Error(error.message)
  return toCategory(data)
}

export async function sbDeleteCategory(id: string) {
  const sb = createAdminClient()

  // Refuse to delete a category that still has events pointing at it.
  const { data: cat } = await sb
    .from('event_categories')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  if (cat?.slug) {
    const { count } = await sb
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('category', cat.slug)
    if ((count ?? 0) > 0) {
      throw new Error(
        `Cannot delete this category — ${count} event(s) still use it.`,
      )
    }
  }

  const { error } = await sb.from('event_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ----------------------------- team members --------------------------------
export async function sbUpsertTeamMember(member: TeamMember) {
  const sb = createAdminClient()
  const row = fromTeamMember(member)
  const id = realId(member.id)

  const { data, error } = id
    ? await sb.from('team_members').update(row).eq('id', id).select('*').single()
    : await sb.from('team_members').insert(row).select('*').single()

  if (error) throw new Error(error.message)
  return toTeamMember(data)
}

export async function sbDeleteTeamMember(id: string) {
  const sb = createAdminClient()
  const { error } = await sb.from('team_members').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------- registrations --------------------------------
export async function sbCreateRegistration(input: {
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
}) {
  // Uses the request-scoped client so the insert runs as the signed-in user and
  // the RLS policy (user_id = auth.uid(), event must be active) is enforced.
  const sb = await createClient()

  const { data, error } = await sb
    .from('registrations')
    .insert({
      user_id: input.userId,
      event_id: input.eventId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      college: input.college,
      department: input.department,
      year: input.year,
      team_name: input.teamName ?? null,
    })
    .select('id')
    .single()

  if (error) {
    // 23505 = unique_violation on (user_id, event_id)
    if (error.code === '23505') {
      throw new Error('You have already registered for this event.')
    }
    throw new Error(error.message)
  }

  const members = (input.members ?? []).filter((m) => m.name?.trim())
  if (members.length > 0) {
    const { error: memberError } = await sb.from('registration_members').insert(
      members.map((m) => ({
        registration_id: data.id,
        name: m.name.trim(),
        email: m.email?.trim() || null,
      })),
    )
    if (memberError) throw new Error(memberError.message)
  }

  return data.id as string
}

export async function sbSetRegistrationStatus(
  id: string,
  status: RegistrationStatus,
) {
  const sb = createAdminClient()
  const { data, error } = await sb
    .from('registrations')
    .update({ status })
    .eq('id', id)
    .select('full_name')
    .single()
  if (error) throw new Error(error.message)
  return data?.full_name as string | undefined
}

export async function sbDeleteRegistration(id: string) {
  const sb = createAdminClient()
  const { error } = await sb.from('registrations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** True when this user already has a row for this event. */
export async function sbHasRegistration(userId: string, eventId: string) {
  const sb = createAdminClient()
  const { count } = await sb
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_id', eventId)
  return (count ?? 0) > 0
}

// -------------------------------- users ------------------------------------
export async function sbSetUserRole(id: string, role: 'user' | 'admin') {
  const sb = createAdminClient()

  // The DB trigger also guards this, but checking here produces a friendlier
  // message than a raw Postgres exception.
  if (role === 'user') {
    const { count } = await sb
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
    if ((count ?? 0) <= 1) {
      throw new Error('Cannot demote the last remaining admin.')
    }
  }

  const { data, error } = await sb
    .from('users')
    .update({ role })
    .eq('id', id)
    .select('email')
    .single()
  if (error) throw new Error(error.message)
  return data?.email as string | undefined
}

export async function sbCountAdmins() {
  const sb = createAdminClient()
  const { count } = await sb
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  return count ?? 0
}

// ------------------------------- messages ----------------------------------
export async function sbAddMessage(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  // Anonymous visitors are allowed to insert by the messages_insert_anyone
  // policy, so the request-scoped client is correct here.
  const sb = await createClient()
  const { error } = await sb.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  })
  if (error) throw new Error(error.message)
}

export async function sbMarkMessageRead(id: string, read: boolean) {
  const sb = createAdminClient()
  const { error } = await sb
    .from('contact_messages')
    .update({ read })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function sbDeleteMessage(id: string) {
  const sb = createAdminClient()
  const { error } = await sb.from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// -------------------------------- audit ------------------------------------
export async function sbAddAudit(
  actorEmail: string,
  action: string,
  target: string,
) {
  const sb = createAdminClient()
  await sb
    .from('admin_audit_logs')
    .insert({ actor_email: actorEmail, action, target })
}

// ------------------------------- settings ----------------------------------
export async function sbSaveSettings(settings: SiteSettings) {
  const sb = createAdminClient()
  const { error } = await sb
    .from('site_settings')
    .update(fromSettings(settings))
    .eq('id', 1)
  if (error) throw new Error(error.message)
}

// --------------------------- starter content -------------------------------
/**
 * Pushes the demo categories/events/team from lib/seed.ts into Supabase.
 * Triggered from /admin/settings so a fresh database is not empty.
 */
export async function sbImportStarterContent() {
  const sb = createAdminClient()
  const { SEED_CATEGORIES, SEED_EVENTS, SEED_TEAM } = await import('@/lib/seed')

  const { error: catError } = await sb.from('event_categories').upsert(
    SEED_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      active: c.active,
      display_order: c.displayOrder,
    })),
    { onConflict: 'slug' },
  )
  if (catError) throw new Error(catError.message)

  const { error: eventError } = await sb
    .from('events')
    .upsert(SEED_EVENTS.map(fromEvent), { onConflict: 'slug' })
  if (eventError) throw new Error(eventError.message)

  // team_members has no natural key, so only seed when the table is empty.
  const { count } = await sb
    .from('team_members')
    .select('id', { count: 'exact', head: true })
  if ((count ?? 0) === 0) {
    const { error: teamError } = await sb
      .from('team_members')
      .insert(SEED_TEAM.map(fromTeamMember))
    if (teamError) throw new Error(teamError.message)
  }

  return {
    categories: SEED_CATEGORIES.length,
    events: SEED_EVENTS.length,
    team: (count ?? 0) === 0 ? SEED_TEAM.length : 0,
  }
}
