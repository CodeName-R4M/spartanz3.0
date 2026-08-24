'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
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

async function audit(action: string, target: string) {
  const admin = await requireAdmin()
  await addAudit({
    id: uid('log'),
    actorEmail: admin.email,
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
  await requireAdmin()
  const id = data.id ?? uid('ev')
  const nowIso = new Date().toISOString()
  const event: EventItem = {
    id,
    name: data.name,
    slug: data.slug || slugify(data.name),
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
    teamSize: data.teamSize ?? { min: 1, max: 1 },
    registrationFee: data.registrationFee ?? 0,
    prizes: data.prizes ?? '',
    coordinator: data.coordinator ?? { name: '', phone: '' },
    status: data.status ?? 'active',
    displayOrder: data.displayOrder ?? 99,
    createdAt: data.createdAt ?? nowIso,
    updatedAt: nowIso,
  }
  await saveEvent(event)
  await audit(data.id ? 'update_event' : 'create_event', event.name)
  revalidateAll()
  return event
}

export async function deleteEvent(id: string, name: string) {
  await requireAdmin()
  await dbDeleteEvent(id)
  await audit('delete_event', name)
  revalidateAll()
}

// ---- Categories ----
export async function upsertCategory(data: Partial<EventCategory> & { name: string }) {
  await requireAdmin()
  const id = data.id ?? uid('cat')
  const nowIso = new Date().toISOString()
  const cat: EventCategory = {
    id,
    name: data.name,
    slug: data.slug || slugify(data.name),
    active: data.active ?? true,
    displayOrder: data.displayOrder ?? 99,
    createdAt: data.createdAt ?? nowIso,
    updatedAt: nowIso,
  }
  await saveCategory(cat)
  await audit(data.id ? 'update_category' : 'create_category', cat.name)
  revalidateAll()
  return cat
}

export async function deleteCategory(id: string, name: string) {
  await requireAdmin()
  await dbDeleteCategory(id)
  await audit('delete_category', name)
  revalidateAll()
}

// ---- Team ----
export async function upsertTeamMember(data: Partial<TeamMember> & { name: string }) {
  await requireAdmin()
  const id = data.id ?? uid('tm')
  const nowIso = new Date().toISOString()
  const member: TeamMember = {
    id,
    name: data.name,
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
  await saveTeamMember(member)
  await audit(data.id ? 'update_team_member' : 'create_team_member', member.name)
  revalidateAll()
  return member
}

export async function deleteTeamMember(id: string, name: string) {
  await requireAdmin()
  await dbDeleteTeamMember(id)
  await audit('delete_team_member', name)
  revalidateAll()
}

// ---- Registrations ----
export async function setRegistrationStatus(
  id: string,
  status: RegistrationStatus,
) {
  await requireAdmin()
  const regs = await getRegistrations()
  const reg = regs.find((r) => r.id === id)
  if (!reg) return
  reg.status = status
  await updateRegistration(reg)
  await audit('update_registration_status', `${reg.fullName} → ${status}`)
  revalidatePath('/admin/registrations')
}

// ---- Users ----
export async function changeUserRole(id: string, role: 'user' | 'admin') {
  const admin = await requireAdmin()
  const updated = await setUserRole(id, role)
  await addAudit({
    id: uid('log'),
    actorEmail: admin.email,
    action: 'change_user_role',
    target: `${updated?.email ?? id} → ${role}`,
    createdAt: new Date().toISOString(),
  })
  revalidatePath('/admin/users')
}

// ---- Settings ----
export async function updateSettings(settings: SiteSettings) {
  await requireAdmin()
  await saveSettings(settings)
  await audit('update_settings', settings.symposiumName)
  revalidateAll()
}
