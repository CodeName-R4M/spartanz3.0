import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { LoginPanel } from '@/components/auth/login-panel'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to SPARTANZ 3.0 to register for events.',
}

export default function LoginPage() {
  return (
    <main
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16"
      style={{ backgroundImage: 'url(/hero-bg.png)' }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background"
      />
      <div className="energy-atmos pointer-events-none absolute inset-0" />

      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-4" />
        Home
      </Link>

      <div className="relative flex w-full justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-xl border border-border bg-card/80 p-8 text-center font-mono text-sm text-muted-foreground backdrop-blur-xl">
              Loading…
            </div>
          }
        >
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  )
}
