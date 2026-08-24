import { getSupabaseServerClient } from "@/lib/supabase/server"
import { demoCategories, demoEvents, demoTeamMembers } from "@/lib/demo-data"
import { siteConfig } from "@/lib/site-config"
import type { EventCategory, SiteSettings, SymposiumEvent, TeamMember } from "@/lib/types"

/**
 * Public read layer.
 *
 * Every function degrades gracefully: if Supabase is not configured yet, or a
 * query fails (e.g. the SQL scripts have not been run), the demo dataset is
 * returned so the site never renders empty for visitors.
 */

const EVENT_SELECT = `
  id, name, slug, category_id, short_description, description, rules,
  image_url, gif_url, event_date, start_time, end_time, venue,
  min_team_size, max_team_size, registration_fee, prizes,
  coordinator_name, coordinator_phone, status, featured, display_order,
  created_at, updated_at,
  event_categories ( name, slug )
`

type RawEvent = Omit<SymposiumEvent, "category_name" | "category_slug"> & {
  event_categories: { name: string; slug: string } | null
}

function mapEvent(row: RawEvent): SymposiumEvent {
  const { event_categories, ...rest } = row
  return {
    ...rest,
    rules: Array.isArray(rest.rules) ? rest.rules : [],
    category_name: event_categories?.name ?? null,
    category_slug: event_categories?.slug ?? null,
  }
}

export async function getCategories(): Promise<EventCategory[]> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return demoCategories

  const { data, error } = await supabase
    .from("event_categories")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })

  if (error || !data?.length) return demoCategories
  return data as EventCategory[]
}

export async function getEvents(options?: { categorySlug?: string; featuredOnly?: boolean }): Promise<
  SymposiumEvent[]
> {
  const supabase = await getSupabaseServerClient()

  if (!supabase) {
    let list = demoEvents.filter((e) => e.status === "active")
    if (options?.categorySlug) list = list.filter((e) => e.category_slug === options.categorySlug)
    if (options?.featuredOnly) list = list.filter((e) => e.featured)
    return list
  }

  let query = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (options?.featuredOnly) query = query.eq("featured", true)

  const { data, error } = await query
  if (error || !data) {
    let list = demoEvents.filter((e) => e.status === "active")
    if (options?.categorySlug) list = list.filter((e) => e.category_slug === options.categorySlug)
    if (options?.featuredOnly) list = list.filter((e) => e.featured)
    return list
  }

  let mapped = (data as unknown as RawEvent[]).map(mapEvent)
  if (options?.categorySlug) mapped = mapped.filter((e) => e.category_slug === options.categorySlug)
  return mapped
}

export async function getEventBySlug(slug: string): Promise<SymposiumEvent | null> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return demoEvents.find((e) => e.slug === slug) ?? null

  const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("slug", slug).maybeSingle()

  if (error || !data) return demoEvents.find((e) => e.slug === slug) ?? null
  return mapEvent(data as unknown as RawEvent)
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) return demoTeamMembers

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })

  if (error || !data?.length) return demoTeamMembers
  return data as TeamMember[]
}

/** Settings are editable from /admin/settings; falls back to lib/site-config.ts */
export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    id: "default",
    symposium_name: siteConfig.symposium,
    subtitle: siteConfig.subtitle,
    college_name: siteConfig.college,
    department_name: siteConfig.department,
    club_name: siteConfig.club,
    event_date: siteConfig.eventDate,
    venue: siteConfig.venue,
    contact_email: siteConfig.contactEmail,
    contact_phone: siteConfig.contactPhone,
    instagram_url: siteConfig.socials.instagram,
    linkedin_url: siteConfig.socials.linkedin,
    github_url: siteConfig.socials.github,
    youtube_url: siteConfig.socials.youtube,
    hero_headline: siteConfig.tagline,
    hero_subline: siteConfig.heroLine,
    countdown_target: siteConfig.countdownTarget,
    registration_open: siteConfig.registrationOpen,
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) return fallback

  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle()
  if (error || !data) return fallback
  return { ...fallback, ...(data as SiteSettings) }
}

/** Public counters shown on the home page. */
export async function getPublicStats() {
  const supabase = await getSupabaseServerClient()
  const events = await getEvents()

  if (!supabase) {
    return {
      events: events.length,
      registrations: demoEvents.reduce((s, e) => s + (e.registration_count ?? 0), 0),
      teamMembers: demoTeamMembers.length,
      colleges: 24,
    }
  }

  const [{ count: registrations }, { count: teamMembers }] = await Promise.all([
    supabase.from("registrations").select("id", { count: "exact", head: true }).neq("status", "CANCELLED"),
    supabase.from("team_members").select("id", { count: "exact", head: true }).eq("active", true),
  ])

  return {
    events: events.length,
    registrations: registrations ?? 0,
    teamMembers: teamMembers ?? 0,
    colleges: 24,
  }
}
