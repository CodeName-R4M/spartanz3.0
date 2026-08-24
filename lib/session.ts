import 'server-only'
import { cookies } from 'next/headers'
import type { User } from './types'
import { findUserByEmail } from './store'
import { isSupabaseEnabled } from './supabase/config'

// ---------------------------------------------------------------------------
// Session handling.
//
// When Supabase credentials are present, the session is the real Supabase Auth
// session (set by the Google OAuth callback in app/auth/callback/route.ts) and
// the role is read from the public.users table.
//
// Without credentials it falls back to a local cookie holding the user id, so
// the app stays usable before setup. Callers only ever see a `User | null`,
// so nothing downstream has to care which mode is active.
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
  if (isSupabaseEnabled()) {
    return getSupabaseUser()
  }

  const id = await getSessionUserId()
  if (!id) return null
  const { getUsers } = await import('./store')
  const users = await getUsers()
  return users.find((u) => u.id === id) ?? null
}

/**
 * Resolves the signed-in Supabase user and joins it with the profile row that
 * carries `role`. Uses getUser() rather than getSession() so the token is
 * verified against the auth server instead of trusted from the cookie.
 */
async function getSupabaseUser(): Promise<User | null> {
  const { createClient } = await import('./supabase/server')
  const { toUser } = await import('./supabase/mappers')

  let sb
  try {
    sb = await createClient()
  } catch {
    return null
  }

  const {
    data: { user: authUser },
  } = await sb.auth.getUser()
  if (!authUser) return null

  const { data: profile } = await sb
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (profile) return toUser(profile)

  // The DB trigger normally creates this row at signup. If it is missing
  // (e.g. the trigger was not installed), fall back to the auth record so the
  // user is not locked out — with the lowest privilege.
  return {
    id: authUser.id,
    name:
      (authUser.user_metadata?.full_name as string) ??
      (authUser.user_metadata?.name as string) ??
      authUser.email ??
      '',
    email: authUser.email ?? '',
    avatarUrl: authUser.user_metadata?.avatar_url as string | undefined,
    role: 'user',
    createdAt: authUser.created_at,
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  return user
}

/**
 * Server-side admin gate. Every admin page and every mutating admin action
 * calls this — hiding the nav link is never the authorization boundary.
 */
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
