'use server'

import { revalidatePath } from 'next/cache'
import {
  clearSession,
  getCurrentUser,
  isInitialAdmin,
  setSessionUserId,
} from '@/lib/session'
import { findUserByEmail, upsertUser, uid } from '@/lib/store'
import { isSupabaseEnabled, siteUrl } from '@/lib/supabase/config'
import type { User } from '@/lib/types'

/**
 * Starts the real Google OAuth flow and returns the URL to send the browser
 * to. Supabase performs the provider exchange, then redirects back to
 * /auth/callback?code=... which establishes the session.
 */
export async function getGoogleOAuthUrl(
  next = '/',
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!isSupabaseEnabled()) {
    return {
      ok: false,
      error:
        'Google sign-in is not configured yet. Add your Supabase keys to .env.local (see .env.example).',
    }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const sb = await createClient()

  const redirectTo = `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`

  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error || !data.url) {
    return {
      ok: false,
      error: error?.message ?? 'Could not start Google sign-in.',
    }
  }
  return { ok: true, url: data.url }
}

/**
 * Local-mode sign-in, used only when Supabase is not configured so the site
 * stays explorable before setup. Once credentials exist this refuses to run and
 * callers must use the real Google flow above.
 */
export async function signInWithGoogle(input: {
  name: string
  email: string
  avatarUrl?: string
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  if (isSupabaseEnabled()) {
    return {
      ok: false,
      error: 'Please use the "Continue with Google" button to sign in.',
    }
  }

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
  if (isSupabaseEnabled()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const sb = await createClient()
      await sb.auth.signOut()
    } catch {
      // fall through and clear the local cookie regardless
    }
  }
  await clearSession()
  revalidatePath('/', 'layout')
}

export async function getMe(): Promise<User | null> {
  return getCurrentUser()
}

/** Lets Client Components know which sign-in path to render. */
export async function getAuthMode(): Promise<'supabase' | 'local'> {
  return isSupabaseEnabled() ? 'supabase' : 'local'
}
