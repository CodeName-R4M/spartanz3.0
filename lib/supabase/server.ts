import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_ANON_KEY, SUPABASE_URL, getServiceRoleKey, isSupabaseConfigured } from "./env"

/**
 * Request-scoped client that respects Row Level Security and the signed-in user.
 * Returns null in demo mode (template env keys).
 */
export async function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component render — safe to ignore, the
          // proxy/middleware refreshes the session cookie instead.
        }
      },
    },
  })
}

/**
 * SERVICE ROLE client. Bypasses RLS — never import this into a Client
 * Component and never return raw results to the browser without an
 * explicit `requireAdmin()` check first.
 */
export function getSupabaseAdminClient() {
  const key = getServiceRoleKey()
  if (!isSupabaseConfigured || !key) return null
  return createClient(SUPABASE_URL as string, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
