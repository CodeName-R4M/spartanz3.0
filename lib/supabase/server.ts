import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getServiceRoleKey,
  isSupabaseEnabled,
} from './config'

/**
 * Request-scoped client. Respects Row Level Security and runs as the signed-in
 * user, so the policies in scripts/002_rls.sql apply.
 *
 * Throws when Supabase is not configured — callers gate on isSupabaseEnabled()
 * first (lib/data.ts and every server action do).
 */
export async function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called during a Server Component render — safe to ignore; the auth
          // callback route refreshes the session cookie instead.
        }
      },
    },
  })
}

/**
 * SERVICE ROLE client. Bypasses RLS entirely — never import this into a Client
 * Component, and never return raw results to the browser without an explicit
 * requireAdmin() check first.
 */
export function createAdminClient() {
  const key = getServiceRoleKey()
  if (!isSupabaseEnabled() || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set — add it to your environment to use admin features.',
    )
  }
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Non-throwing variant for read paths that fall back to the local store. */
export async function tryCreateClient() {
  if (!isSupabaseEnabled()) return null
  try {
    return await createClient()
  } catch {
    return null
  }
}
