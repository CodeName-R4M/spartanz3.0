'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/session'
import { isSupabaseEnabled } from '@/lib/supabase/config'
import {
  addMessage,
  addRegistration,
  getEvents,
  getRegistrations,
  uid,
} from '@/lib/store'
import { getEvents, fetchMyRegistrations } from '@/lib/data'
import type {
  ContactMessage,
  Registration,
  RegistrationMember,
} from '@/lib/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d][\d\s-]{7,}$/

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
  if (name.length > 120) {
    return { ok: false, error: 'Name is too long.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (subject.length > 160) {
    return { ok: false, error: 'Subject is too long.' }
  }
  if (message.length > 4000) {
    return { ok: false, error: 'Message is too long (4000 characters max).' }
  }

  try {
    if (isSupabaseEnabled()) {
      const { sbAddMessage } = await import('@/lib/supabase/mutations')
      await sbAddMessage({ name, email, subject, message })
    } else {
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
    }
    revalidatePath('/admin/messages')
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Could not send your message. Please try again.',
    }
  }
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

  // Always re-read the event server-side; never trust fee/team size from the
  // client payload.
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
  if (!EMAIL_RE.test(input.email.trim())) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  if (!PHONE_RE.test(input.phone.trim())) {
    return { ok: false, error: 'Please enter a valid phone number.' }
  }

  const members = (input.members ?? [])
    .filter((m) => m.name?.trim())
    .map((m) => ({ name: m.name.trim(), email: m.email?.trim() || undefined }))

  // Team size is validated against the event record, counting the lead.
  const memberCount = 1 + members.length
  if (memberCount < event.teamSize.min) {
    return {
      ok: false,
      error: `This event needs at least ${event.teamSize.min} participant(s).`,
    }
  }
  if (memberCount > event.teamSize.max) {
    return {
      ok: false,
      error: `This event allows at most ${event.teamSize.max} participant(s).`,
    }
  }
  if (event.teamSize.max > 1 && !input.teamName?.trim()) {
    return { ok: false, error: 'Please provide a team name.' }
  }

  try {
    if (isSupabaseEnabled()) {
      const { sbCreateRegistration, sbHasRegistration } = await import(
        '@/lib/supabase/mutations'
      )
      if (await sbHasRegistration(user.id, event.id)) {
        return { ok: false, error: 'You have already registered for this event.' }
      }
      const id = await sbCreateRegistration({
        userId: user.id,
        eventId: event.id,
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        college: input.college.trim(),
        department: input.department.trim(),
        year: input.year.trim(),
        teamName: input.teamName?.trim() || undefined,
        members,
      })
      revalidatePath('/dashboard')
      revalidatePath('/admin/registrations')
      return { ok: true, registrationId: id }
    }

    const existing = await getRegistrations()
    if (
      existing.some(
        (r) =>
          r.userId === user.id &&
          r.eventId === event.id &&
          r.status !== 'cancelled',
      )
    ) {
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
      members,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    await addRegistration(reg)
    revalidatePath('/dashboard')
    revalidatePath('/admin/registrations')
    return { ok: true, registrationId: reg.id }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Could not complete your registration. Please try again.',
    }
  }
}

export async function getMyRegistrations() {
  const user = await getCurrentUser()
  if (!user) return []
  return fetchMyRegistrations(user.id)
}

/** Event ids the signed-in user has already registered for. */
export async function getMyRegisteredEventIds(): Promise<string[]> {
  const user = await getCurrentUser()
  if (!user) return []
  const regs = await fetchMyRegistrations(user.id)
  return regs.filter((r) => r.status !== 'cancelled').map((r) => r.eventId)
}
