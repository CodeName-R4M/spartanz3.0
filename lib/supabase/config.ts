// Central place to read Supabase configuration.
//
// The app runs in two modes:
//
//   1. LOCAL / DEMO  — no real Supabase keys set. The JSON file store in
//      lib/store.ts backs every read and write, so the site is fully browsable
//      and the admin panel works without any setup.
//
//   2. SUPABASE      — once the values from .env.example are filled in with
//      real credentials, isSupabaseEnabled() flips to true and lib/data.ts plus
//      the server actions route through Postgres instead.
//
// Every .env file in this repo ships with template placeholders. `clean()`
// treats those placeholders as "not set", so the committed template never fakes
// a configured database — real keys can be pasted in later without touching a
// single line of UI code.

/** Placeholder prefixes used across the .env templates. */
const PLACEHOLDERS = [
  'replace_me',
  'your-',
  'your_',
  'changeme',
  'todo',
  'xxx',
  '<',
]

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined
  const v = value.trim()
  if (!v) return undefined
  const lower = v.toLowerCase()
  if (PLACEHOLDERS.some((p) => lower.startsWith(p))) return undefined
  return v
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? ''
export const SUPABASE_ANON_KEY =
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? ''

/** True only when both public Supabase values are present and real. */
export function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Server-only. The service-role key, or undefined when it is a placeholder. */
export function getServiceRoleKey(): string | undefined {
  return clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** Server-only. True when the service role key is also available. */
export function hasServiceRole(): boolean {
  return Boolean(getServiceRoleKey())
}

/**
 * The email promoted to admin the first time it signs in. Override it with
 * INITIAL_ADMIN_EMAIL; falls back to the project owner so a fresh database
 * always has exactly one guaranteed way in.
 */
export const DEFAULT_INITIAL_ADMIN_EMAIL = 'sriramisno1@gmail.com'

export function getInitialAdminEmail(): string {
  return (
    clean(process.env.INITIAL_ADMIN_EMAIL)?.toLowerCase() ??
    DEFAULT_INITIAL_ADMIN_EMAIL
  )
}

/** Storage bucket used for event and team images. */
export function getStorageBucket(): string {
  return (
    clean(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET) ?? 'spartanz-media'
  )
}

/** Absolute site origin, used to build OAuth redirect URLs. */
export function siteUrl(): string {
  const explicit = clean(process.env.NEXT_PUBLIC_SITE_URL)
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
