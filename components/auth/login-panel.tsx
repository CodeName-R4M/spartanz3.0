'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { getAuthMode, getGoogleOAuthUrl } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
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

const PERSONAS = [
  { name: 'Admin (RootSec)', email: 'admin@rootsec.dev' },
  { name: 'Aditi Sharma', email: 'aditi.student@example.com' },
]

export function LoginPanel() {
  const { user, signIn, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'supabase' | 'local' | null>(null)

  useEffect(() => {
    void getAuthMode().then(setMode)
  }, [])

  useEffect(() => {
    if (!authLoading && user) router.replace(next)
  }, [authLoading, user, next, router])

  async function handleGoogle() {
    setLoading(true)
    const res = await getGoogleOAuthUrl(next)
    if (res.ok && res.url) {
      window.location.href = res.url
      return
    }
    setLoading(false)
    toast.error(res.error ?? 'Could not start Google sign-in.')
  }

  async function handleLocal(payload: { name: string; email: string }) {
    if (!payload.name.trim() || !payload.email.trim()) {
      toast.error('Enter a name and email to continue.')
      return
    }
    setLoading(true)
    const res = await signIn(payload)
    setLoading(false)
    if (res.ok) {
      toast.success('Signed in successfully.')
      router.replace(next)
    } else {
      toast.error(res.error ?? 'Sign in failed.')
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 backdrop-blur-xl box-glow">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          SPARTANZ 3.0
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase text-foreground">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'supabase'
            ? 'Continue with your Google account to enter the arena.'
            : 'Demo sign-in is active until Supabase keys are added.'}
        </p>
      </div>

      {mode === 'supabase' ? (
        <div className="mt-8">
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={loading}
            onClick={handleGoogle}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleGlyph />
            )}
            Continue with Google
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-name">Full name</Label>
            <Input
              id="login-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            className="w-full gap-2"
            variant="outline"
            disabled={loading}
            onClick={() => handleLocal({ name, email })}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleGlyph />
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              or quick demo
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            {PERSONAS.map((p) => (
              <Button
                key={p.email}
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={() => handleLocal(p)}
                className="justify-start"
              >
                {p.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {p.email}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
