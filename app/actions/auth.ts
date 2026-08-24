'use server'

import { revalidatePath } from 'next/cache'
import {
  clearSession,
  getCurrentUser,
  isInitialAdmin,
  setSessionUserId,
} from '@/lib/session'
import { findUserByEmail, upsertUser } from '@/lib/store'
import { uid } from '@/lib/store'
import type { User } from '@/lib/types'

// Simulated "Sign in with Google". In production this is replaced by the
// Supabase OAuth callback, which creates/looks up the user then sets the
// session. The role is derived from INITIAL_ADMIN_EMAIL on first sign-in.
export async function signInWithGoogle(input: {
  name: string
  email: string
  avatarUrl?: string
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!email || !name) {
    return { ok: false, error: 'Name and email are required.' }
  }

  let user = await findUserByEmail(email)
  if (!user) {
    user = {
      id: uid('usr'),
      name,
      email,
      avatarUrl: input.avatarUrl,
      role: isInitialAdmin(email) ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    }
    await upsertUser(user)
  } else if (isInitialAdmin(email) && user.role !== 'admin') {
    // ensure the configured initial admin is always elevated
    user.role = 'admin'
    await upsertUser(user)
  }

  await setSessionUserId(user.id)
  revalidatePath('/', 'layout')
  return { ok: true, user }
}

export async function signOut(): Promise<void> {
  await clearSession()
  revalidatePath('/', 'layout')
}

export async function getMe(): Promise<User | null> {
  return getCurrentUser()
}
