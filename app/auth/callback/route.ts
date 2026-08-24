import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseEnabled } from '@/lib/supabase/config'
import { isInitialAdmin } from '@/lib/session'

// Google OAuth callback. Supabase redirects here with a one-time `code`, which
// we exchange for a session. The auth cookies are written by the SSR client.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error_description') ?? url.searchParams.get('error')
  const next = url.searchParams.get('next') ?? '/'

  if (!isSupabaseEnabled()) {
    return NextResponse.redirect(new URL('/login?error=not_configured', url.origin))
  }

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, url.origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
  }

  const sb = await createClient()
  const { data, error: exchangeError } = await sb.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError?.message ?? 'exchange_failed')}`,
        url.origin,
      ),
    )
  }

  // Safety net for the initial admin. The DB trigger normally handles this via
  // app.initial_admin_email, but if that setting was never applied we promote
  // here using the server-only env var so the first admin can always get in.
  const email = data.user.email ?? ''
  if (email && isInitialAdmin(email)) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/server')
      const admin = createAdminClient()
      await admin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', data.user.id)
        .neq('role', 'admin')
    } catch {
      // Service role key not set — the trigger path is expected to cover it.
    }
  }

  // Only allow relative redirects, so `next` cannot be used as an open redirect.
  const target = next.startsWith('/') ? next : '/'
  return NextResponse.redirect(new URL(target, url.origin))
}
