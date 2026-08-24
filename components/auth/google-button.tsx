'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getGoogleOAuthUrl } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

export function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-5', className)} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C36.6 4.5 30.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C36.6 4.5 30.6 2 24 2 15.7 2 8.6 6.8 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 46c6.5 0 12.4-2.5 16.8-6.5l-7.8-6.4c-2.2 1.6-5 2.6-9 2.6-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.5 41.1 15.6 46 24 46z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l7.8 6.4C43.9 36.9 46 31 46 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  )
}

/**
 * Kicks off Supabase's Google OAuth flow. The provider URL is generated in a
 * server action so no client id ever reaches the browser bundle.
 */
export function GoogleSignInButton({
  next = '/',
  className,
  size = 'lg',
  label = 'Continue with Google',
  onError,
}: {
  next?: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  label?: string
  onError?: (message: string) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await getGoogleOAuthUrl(next)
    if (res.ok && res.url) {
      // Full page navigation to Google's consent screen.
      window.location.href = res.url
      return
    }
    setLoading(false)
    const message = res.error ?? 'Could not start Google sign-in.'
    if (onError) onError(message)
    else toast.error(message)
  }

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      disabled={loading}
      onClick={handleClick}
      className={cn(
        'w-full gap-2.5 border-border/80 bg-secondary/40 font-medium hover:bg-secondary',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <GoogleGlyph />
      )}
      {loading ? 'Redirecting to Google…' : label}
    </Button>
  )
}
