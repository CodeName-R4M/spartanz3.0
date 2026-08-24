import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { siteConfig } from '@/lib/site-config'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 hud-grid radial-fade opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            The Endgame Awaits
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground text-glow-red text-balance sm:text-6xl">
            Are You Ready for Doomsday?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
            Secure your spot at {siteConfig.event}. Limited slots. Infinite glory. Sign in with
            Google and register in under a minute.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold tracking-wide text-primary-foreground transition-all hover:bg-primary/85 box-glow-red sm:w-auto"
            >
              REGISTER NOW
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-primary/40 px-8 text-sm font-semibold text-foreground transition-all hover:bg-primary/10 sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
