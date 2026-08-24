'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/session'
import {
  addMessage,
  addRegistration,
  getEvents,
  getRegistrations,
  uid,
} from '@/lib/store'
import type { ContactMessage, Registration, RegistrationMember } from '@/lib/types'

export async function submitContact(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim()
  const email = input.email?.trim()
  const subject = input.subject?.trim()
  const message = input.message?.trim()
  if (!name || !email || !subject || !message) {
    return { ok: false, error: 'All fields are required.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  const msg: ContactMessage = {
    id: uid('msg'),
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  }
  await addMessage(msg)
  return { ok: true }
}

export async function registerForEvent(input: {
  eventId: string
  fullName: string
  email: string
  phone: string
  college: string
  department: string
  year: string
  teamName?: string
  members: RegistrationMember[]
}): Promise<{ ok: boolean; error?: string; registrationId?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: 'You must be signed in to register.' }
  }

  const events = await getEvents()
  const event = events.find((e) => e.id === input.eventId)
  if (!event || event.status !== 'active') {
    return { ok: false, error: 'This event is not open for registration.' }
  }

  const required = [
    input.fullName,
    input.email,
    input.phone,
    input.college,
    input.department,
    input.year,
  ]
  if (required.some((v) => !v?.trim())) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (!/^[+\d][\d\s-]{7,}$/.test(input.phone)) {
    return { ok: false, error: 'Please enter a valid phone number.' }
  }

  // Team size validation
  const memberCount = 1 + (input.members?.length ?? 0)
  if (memberCount < event.teamSize.min) {
    return {
      ok: false,
      error: `This event needs at least ${event.teamSize.min} members.`,
    }
  }
  if (memberCount > event.teamSize.max) {
    return {
      ok: false,
      error: `This event allows at most ${event.teamSize.max} members.`,
    }
  }

  // Prevent duplicate registration by same user for same event
  const existing = await getRegistrations()
  if (existing.some((r) => r.userId === user.id && r.eventId === event.id && r.status !== 'cancelled')) {
    return { ok: false, error: 'You have already registered for this event.' }
  }

  const reg: Registration = {
    id: uid('reg'),
    userId: user.id,
    eventId: event.id,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    college: input.college.trim(),
    department: input.department.trim(),
    year: input.year.trim(),
    teamName: input.teamName?.trim() || undefined,
    members: (input.members ?? []).filter((m) => m.name?.trim()),
    status: 'registered',
    createdAt: new Date().toISOString(),
  }
  await addRegistration(reg)
  revalidatePath('/dashboard')
  revalidatePath('/admin/registrations')
  return { ok: true, registrationId: reg.id }
}

export async function getMyRegistrations() {
  const user = await getCurrentUser()
  if (!user) return []
  const regs = await getRegistrations()
  return regs.filter((r) => r.userId === user.id)
}
