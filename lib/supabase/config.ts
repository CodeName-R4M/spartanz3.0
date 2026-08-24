// Central place to read Supabase configuration.
//
// The app is built to run in two modes:
//
//   1. LOCAL / DEMO  — no Supabase keys set. The JSON file store in
//      lib/store.ts backs every read and write, so the site is fully
//      browsable and the admin panel works without any setup.
//
//   2. SUPABASE      — once the keys in .env.example are filled in,
//      isSupabaseEnabled() flips to true and lib/data.ts + the server
//      actions route through Postgres instead.
//
// This lets you fill in credentials later without touching any UI code.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** True only when both public Supabase values are present. */
export function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Server-only. True when the service role key is also available. */
export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** Absolute site origin, used to build OAuth redirect URLs. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
