// @ts-nocheck
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"
import { getInitialAdminEmail } from "@/lib/supabase/env"
import type { AppUser, Role } from "@/lib/types"

/**
 * Resolves the signed-in user AND their database role.
 *
 * SECURITY: the role is always read from the `profiles` table using the
 * server client — never from client-supplied data or JWT metadata the user
 * could influence. Returns null when signed out or in demo mode.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (profile) return profile as AppUser

  // First sign-in: create the profile row. The DB trigger normally handles
  // this, but we self-heal here so a missing trigger never blocks a user.
  const admin = getSupabaseAdminClient()
  const initialAdmin = getInitialAdminEmail()
  const email = (user.email ?? "").toLowerCase()
  const role: Role = initialAdmin && email === initialAdmin ? "admin" : "user"

  const row = {
    id: user.id,
    email,
    full_name: (user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    role,
  }

  if (admin) {
    const { data: created } = await admin.from("profiles").upsert(row, { onConflict: "id" }).select("*").maybeSingle()
    if (created) return created as AppUser
  }

  return {
    ...row,
    phone: null,
    college: null,
    department: null,
    year: null,
    created_at: new Date().toISOString(),
  } as AppUser
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

/**
 * Server-side gate for every admin mutation and admin data read.
 * Throws so that a route/action can never accidentally continue unauthorized.
 */
export async function requireAdmin(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHENTICATED")
  if (user.role !== "admin") throw new Error("FORBIDDEN")
  return user
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHENTICATED")
  return user
}

export async function writeAuditLog(actorEmail: string, action: string, target?: string, details?: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return
  await admin.from("admin_audit_logs").insert({
    actor_email: actorEmail,
    action,
    target: target ?? null,
    details: details ?? null,
  })
}
