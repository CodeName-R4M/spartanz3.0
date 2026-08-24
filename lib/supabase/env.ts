/**
 * Env access helpers.
 *
 * The app is built so that it still renders (in demo mode, using
 * lib/demo-data.ts) when the Supabase keys are still template placeholders.
 * Fill in .env.local from .env.example to switch to live data.
 */
function clean(value: string | undefined) {
  if (!value) return undefined
  const v = value.trim()
  if (!v || v.startsWith("REPLACE_ME")) return undefined
  return v
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
export const SUPABASE_ANON_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export function getServiceRoleKey() {
  return clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getInitialAdminEmail() {
  return clean(process.env.INITIAL_ADMIN_EMAIL)?.toLowerCase()
}

export function getStorageBucket() {
  return clean(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET) ?? "spartanz-media"
}
