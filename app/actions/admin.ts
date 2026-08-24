'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { isSupabaseEnabled } from '@/lib/supabase/config'
import {
  addAudit,
  deleteCategory as dbDeleteCategory,
  deleteEvent as dbDeleteEvent,
  deleteTeamMember as dbDeleteTeamMember,
  getRegistrations,
  saveCategory,
  saveEvent,
  saveSettings,
  saveTeamMember,
  setUserRole,
  uid,
  updateRegistration,
} from '@/lib/store'
import type {
  EventCategory,
  EventItem,
  RegistrationStatus,
  SiteSettings,
  TeamMember,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Admin server actions.
//
// EVERY exported action starts with requireAdmin(), which resolves the session
// server-side and throws unless role === 'admin'. Hiding the nav link is not
// the authorization boundary; this is (together with the RLS policies).
//
// Each action then dispatches to Supabase or the local JSON store depending on
// whether credentials are configured.
// ---------------------------------------------------------------------------

type ActionResult<T = void> = {
  ok: boolean
  error?: string
  data?: T
}

/** Wraps an action so thrown errors become a typed result instead of a crash. */
async function guard<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong.'
    if (message === 'UNAUTHORIZED' || message === 'UNAUTHENTICATED') {
      return { ok: false, error: 'You are not authorized to do that.' }
    }
    return { ok: false, error: message }
  }
}

async function audit(actorEmail: string, action: string, target: string) {
  if (isSupabaseEnabled()) {
    const { sbAddAudit } = await import('@/lib/supabase/mutations')
    await sbAddAudit(actorEmail, action, target)
    return
  }
  await addAudit({
    id: uid('log'),
    actorEmail,
    action,
    target,
    createdAt: new Date().toISOString(),
  })
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function revalidateAll() {
  revalidatePath('/', 'layout')
}

// ---- Events ----
export async function upsertEvent(data: Partial<EventItem> & { name: string }) {
  return guard(async () => {
    const admin = await requireAdmin()

    if (!data.name?.trim()) throw new Error('Event name is required.')
    const min = data.teamSize?.min ?? 1
    const max = data.teamSize?.max ?? 1
    if (min < 1) throw new Error('Minimum team size must be at least 1.')
    if (max < min) {
      throw new Error('Maximum team size cannot be less than the minimum.')
    }
    if ((data.registrationFee ?? 0) < 0) {
      throw new Error('Registration fee cannot be negative.')
    }

    const nowIso = new Date().toISOString()
    const event: EventItem = {
      id: data.id ?? uid('ev'),
      name: data.name.trim(),
      slug: data.slug?.trim() || slugify(data.name),
      category: data.category ?? 'technical',
      shortDescription: data.shortDescription ?? '',
      description: data.description ?? '',
      rules: data.rules ?? [],
      image: data.image || '/events/ctf.png',
      gif: data.gif,
      date: data.date ?? '',
      startTime: data.startTime ?? '',
      endTime: data.endTime ?? '',
      venue: data.venue ?? '',
      teamSize: { min, max },
      registrationFee: data.registrationFee ?? 0,
      prizes: data.prizes ?? '',
      coordinator: data.coordinator ?? { name: '', phone: '' },
      status: data.status ?? 'active',
      displayOrder: data.displayOrder ?? 99,
      createdAt: data.createdAt ?? nowIso,
      updatedAt: nowIso,
    }

    if (isSupabaseEnabled()) {
      const { sbUpsertEvent } = await import('@/lib/supabase/mutations')
      await sbUpsertEvent(event)
    } else {
      await saveEvent(event)
    }

    await audit(
      admin.email,
      data.id ? 'update_event' : 'create_event',
      event.name,
    )
    revalidateAll()
  })
}

export async function deleteEvent(id: string, name: string) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (isSupabaseEnabled()) {
      const { sbDeleteEvent } = await import('@/lib/supabase/mutations')
      await sbDeleteEvent(id)
    } else {
      await dbDeleteEvent(id)
    }
    await audit(admin.email, 'delete_event', name)
    revalidateAll()
  })
}

// ---- Categories ----
export async function upsertCategory(
  data: Partial<EventCategory> & { name: string },
) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (!data.name?.trim()) throw new Error('Category name is required.')

    const nowIso = new Date().toISOString()
    const cat: EventCategory = {
      id: data.id ?? uid('cat'),
      name: data.name.trim(),
      slug: data.slug?.trim() || slugify(data.name),
      active: data.active ?? true,
      displayOrder: data.displayOrder ?? 99,
      createdAt: data.createdAt ?? nowIso,
      updatedAt: nowIso,
    }

    if (isSupabaseEnabled()) {
      const { sbUpsertCategory } = await import('@/lib/supabase/mutations')
      await sbUpsertCategory(cat)
    } else {
      await saveCategory(cat)
    }

    await audit(
      admin.email,
      data.id ? 'update_category' : 'create_category',
      cat.name,
    )
    revalidateAll()
  })
}

export async function deleteCategory(id: string, name: string) {
  return guard(async () => {
    const admin = await requireAdmin()

    if (isSupabaseEnabled()) {
      const { sbDeleteCategory } = await import('@/lib/supabase/mutations')
      await sbDeleteCategory(id)
    } else {
      // Mirror the Supabase guard: never orphan events.
      const { getEvents, getCategories } = await import('@/lib/store')
      const cats = await getCategories()
      const cat = cats.find((c) => c.id === id)
      if (cat) {
        const events = await getEvents()
        const used = events.filter((e) => e.category === cat.slug).length
        if (used > 0) {
          throw new Error(
            `Cannot delete this category — ${used} event(s) still use it.`,
          )
        }
      }
      await dbDeleteCategory(id)
    }

    await audit(admin.email, 'delete_category', name)
    revalidateAll()
  })
}

// ---- Team ----
export async function upsertTeamMember(
  data: Partial<TeamMember> & { name: string },
) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (!data.name?.trim()) throw new Error('Member name is required.')

    const nowIso = new Date().toISOString()
    const member: TeamMember = {
      id: data.id ?? uid('tm'),
      name: data.name.trim(),
      role: data.role ?? '',
      category: data.category ?? 'organizing-committee',
      photo: data.photo || '/team/avatar-1.png',
      shortBio: data.shortBio,
      department: data.department,
      year: data.year,
      displayOrder: data.displayOrder ?? 99,
      active: data.active ?? true,
      createdAt: data.createdAt ?? nowIso,
      updatedAt: nowIso,
    }

    if (isSupabaseEnabled()) {
      const { sbUpsertTeamMember } = await import('@/lib/supabase/mutations')
      await sbUpsertTeamMember(member)
    } else {
      await saveTeamMember(member)
    }

    await audit(
      admin.email,
      data.id ? 'update_team_member' : 'create_team_member',
      member.name,
    )
    revalidateAll()
  })
}

export async function deleteTeamMember(id: string, name: string) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (isSupabaseEnabled()) {
      const { sbDeleteTeamMember } = await import('@/lib/supabase/mutations')
      await sbDeleteTeamMember(id)
    } else {
      await dbDeleteTeamMember(id)
    }
    await audit(admin.email, 'delete_team_member', name)
    revalidateAll()
  })
}

// ---- Registrations ----
export async function setRegistrationStatus(
  id: string,
  status: RegistrationStatus,
) {
  return guard(async () => {
    const admin = await requireAdmin()

    if (isSupabaseEnabled()) {
      const { sbSetRegistrationStatus } = await import(
        '@/lib/supabase/mutations'
      )
      const name = await sbSetRegistrationStatus(id, status)
      await audit(
        admin.email,
        'update_registration_status',
        `${name ?? id} → ${status}`,
      )
    } else {
      const regs = await getRegistrations()
      const reg = regs.find((r) => r.id === id)
      if (!reg) throw new Error('Registration not found.')
      reg.status = status
      await updateRegistration(reg)
      await audit(
        admin.email,
        'update_registration_status',
        `${reg.fullName} → ${status}`,
      )
    }

    revalidatePath('/admin/registrations')
    revalidatePath('/admin')
  })
}

export async function deleteRegistration(id: string, name: string) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (isSupabaseEnabled()) {
      const { sbDeleteRegistration } = await import('@/lib/supabase/mutations')
      await sbDeleteRegistration(id)
    } else {
      const { db, commit } = await import('@/lib/store')
      const d = await db()
      d.registrations = d.registrations.filter((r) => r.id !== id)
      await commit()
    }
    await audit(admin.email, 'delete_registration', name)
    revalidatePath('/admin/registrations')
    revalidatePath('/admin')
  })
}

// ---- Users ----
export async function changeUserRole(id: string, role: 'user' | 'admin') {
  return guard(async () => {
    const admin = await requireAdmin()

    // An admin must not be able to strip their own access and lock everyone out.
    if (id === admin.id && role === 'user') {
      throw new Error('You cannot remove your own admin access.')
    }

    if (isSupabaseEnabled()) {
      const { sbSetUserRole } = await import('@/lib/supabase/mutations')
      const email = await sbSetUserRole(id, role)
      await audit(admin.email, 'change_user_role', `${email ?? id} → ${role}`)
    } else {
      const { getUsers } = await import('@/lib/store')
      if (role === 'user') {
        const users = await getUsers()
        const admins = users.filter((u) => u.role === 'admin')
        if (admins.length <= 1) {
          throw new Error('Cannot demote the last remaining admin.')
        }
      }
      const updated = await setUserRole(id, role)
      await audit(
        admin.email,
        'change_user_role',
        `${updated?.email ?? id} → ${role}`,
      )
    }

    revalidatePath('/admin/users')
    revalidateAll()
  })
}

// ---- Messages ----
export async function markMessageRead(id: string, read: boolean) {
  return guard(async () => {
    await requireAdmin()
    if (isSupabaseEnabled()) {
      const { sbMarkMessageRead } = await import('@/lib/supabase/mutations')
      await sbMarkMessageRead(id, read)
    } else {
      const { db, commit } = await import('@/lib/store')
      const d = await db()
      const msg = d.messages.find((m) => m.id === id)
      if (msg) msg.read = read
      await commit()
    }
    revalidatePath('/admin/messages')
  })
}

export async function deleteMessage(id: string) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (isSupabaseEnabled()) {
      const { sbDeleteMessage } = await import('@/lib/supabase/mutations')
      await sbDeleteMessage(id)
    } else {
      const { db, commit } = await import('@/lib/store')
      const d = await db()
      d.messages = d.messages.filter((m) => m.id !== id)
      await commit()
    }
    await audit(admin.email, 'delete_message', id)
    revalidatePath('/admin/messages')
  })
}

// ---- Settings ----
export async function updateSettings(settings: SiteSettings) {
  return guard(async () => {
    const admin = await requireAdmin()
    if (!settings.symposiumName?.trim()) {
      throw new Error('Symposium name is required.')
    }
    if (isSupabaseEnabled()) {
      const { sbSaveSettings } = await import('@/lib/supabase/mutations')
      await sbSaveSettings(settings)
    } else {
      await saveSettings(settings)
    }
    await audit(admin.email, 'update_settings', settings.symposiumName)
    revalidateAll()
  })
}

/** Seeds a fresh Supabase database with the demo content from lib/seed.ts. */
export async function importStarterContent() {
  return guard(async () => {
    const admin = await requireAdmin()
    if (!isSupabaseEnabled()) {
      throw new Error(
        'Starter content is already loaded in local mode. Add Supabase keys first.',
      )
    }
    const { sbImportStarterContent } = await import('@/lib/supabase/mutations')
    const result = await sbImportStarterContent()
    await audit(
      admin.email,
      'import_starter_content',
      `${result.events} events, ${result.team} team members`,
    )
    revalidateAll()
    return result
  })
}

/** Bulk display-order update used by the reorder controls. */
export async function reorderItems(
  kind: 'event' | 'category' | 'team',
  items: { id: string; displayOrder: number }[],
) {
  return guard(async () => {
    const admin = await requireAdmin()

    if (isSupabaseEnabled()) {
      const { createAdminClient } = await import('@/lib/supabase/server')
      const sb = createAdminClient()
      const table =
        kind === 'event'
          ? 'events'
          : kind === 'category'
            ? 'event_categories'
            : 'team_members'
      for (const item of items) {
        const { error } = await sb
          .from(table)
          .update({ display_order: item.displayOrder })
          .eq('id', item.id)
        if (error) throw new Error(error.message)
      }
    } else {
      const { db, commit } = await import('@/lib/store')
      const d = await db()
      const list =
        kind === 'event' ? d.events : kind === 'category' ? d.categories : d.team
      for (const item of items) {
        const row = list.find((x) => x.id === item.id)
        if (row) row.displayOrder = item.displayOrder
      }
      await commit()
    }

    await audit(admin.email, `reorder_${kind}`, `${items.length} items`)
    revalidateAll()
  })
}
