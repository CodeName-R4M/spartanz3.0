import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseEnabled } from './config'

/**
 * Request-scoped Supabase client that reads and refreshes the auth cookies.
 * Use this for anything that should respect row level security.
 *
 * In Next.js 16 `cookies()` is async, so this helper is async too.
 */
export async function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).',
    )
  }

  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component render, where cookies are
          // read-only. The proxy refreshes the session instead, so this is
          // safe to swallow.
        }
      },
    },
  })
}

/**
 * Admin client using the service role key. This BYPASSES row level security,
 * so it must never be imported into a Client Component, and every caller is
 * responsible for its own authorization check (see requireAdmin()).
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!isSupabaseEnabled() || !serviceKey) {
    throw new Error(
      'Supabase service role is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).',
    )
  }
  return createSupabaseClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
