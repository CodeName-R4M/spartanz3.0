'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseEnabled } from './config'

// Browser Supabase client. Only ever uses the public anon key, so every query
// it makes is subject to the row level security policies in scripts/schema.sql.

let cached: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).',
    )
  }
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return cached
}
