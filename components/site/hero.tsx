import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Countdown } from './countdown'
import type { SiteSettings } from '@/lib/types'

interface HeroProps {
  settings: SiteSettings
}

export function Hero({ settings }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.png)' }}
      />
      {/* Cinematic overlays */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/60 to-background"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_95%)]"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-24 text-center sm:px-6">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-primary">
          {settings.theme}
        </p>

        <h1 className="text-balance font-sans text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-foreground sm:text-8xl md:text-9xl">
          {settings.symposiumName}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          {settings.heroTagline}
        </p>

        <p className="mt-3 font-mono text-sm uppercase tracking-[0.25em] text-foreground/70">
          {settings.date} • {settings.college}
        </p>

        <div className="mt-10 flex justify-center">
          <Countdown target={settings.countdownDate} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full min-w-52 text-base sm:w-auto"
          >
            <Link href="/events">Explore Events</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full min-w-52 border-primary/40 bg-transparent text-base sm:w-auto"
          >
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
      >
        Scroll
      </div>
    </section>
  )
}
