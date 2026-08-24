import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './types'
import { findUserByEmail } from './store'

// ---------------------------------------------------------------------------
// Session handling. In this mock phase the session cookie stores the signed-in
// user's id. When Supabase Auth + Google OAuth is wired in, replace
// getCurrentUser() with a Supabase session lookup and keep the same return
// shape so callers (server actions, admin guards) stay unchanged.
// ---------------------------------------------------------------------------

const COOKIE = 'spartanz_session'

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE)?.value ?? null
}

export async function setSessionUserId(id: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getSessionUserId()
  if (!id) return null
  const { getUsers } = await import('./store')
  const users = await getUsers()
  return users.find((u) => u.id === id) ?? null
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin') {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

export function isInitialAdmin(email: string): boolean {
  const admin = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase()
  return !!admin && email.toLowerCase() === admin
}

export { findUserByEmail }
