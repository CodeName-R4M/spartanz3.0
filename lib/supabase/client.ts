"use client"

import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env"

let cached: ReturnType<typeof createBrowserClient> | null = null

/** Returns null when Supabase env keys are still placeholders (demo mode). */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null
  if (!cached) {
    cached = createBrowserClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  }
  return cached
}

export { isSupabaseConfigured }
