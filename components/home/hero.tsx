import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/site/countdown"
import { HologramCore } from "@/components/motion/hologram-core"
import { ParticleField } from "@/components/motion/particle-field"
import { Reveal } from "@/components/motion/reveal"
import { siteConfig } from "@/lib/site-config"
import type { SiteSettings } from "@/lib/types"

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Layer 1 — static background art (priority, sized, no layout shift) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-portal.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.145_0.014_20/70%),oklch(0.145_0.014_20/86%)_55%,var(--background))]" />
        <div className="hud-grid absolute inset-0" />
      </div>

      {/* Layer 2 — embers, high-tier devices only */}
      <ParticleField className="-z-10" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:pb-28 lg:pt-28">
        <div className="flex-1">
          <Reveal className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1.5">
            <span className="size-1.5 animate-pulse-glow rounded-full bg-primary" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-primary">
              {siteConfig.theme}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2.6rem] font-black uppercase leading-[0.92] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              <span className="block text-foreground">Spartanz</span>
              <span className="block text-primary text-glow">3.0</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-xl font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {settings.hero_headline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/85 text-pretty sm:text-lg">
              {settings.hero_subline}
            </p>
          </Reveal>

          <Reveal delay={200} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="clip-notch group font-mono text-xs uppercase tracking-[0.18em]">
              <Link href="/register">
                Register Now
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="clip-notch border-border bg-card/50 font-mono text-xs uppercase tracking-[0.18em]"
            >
              <Link href="/events">Explore Events</Link>
            </Button>
          </Reveal>

          <Reveal delay={260} className="mt-10 flex flex-col gap-5">
            <Countdown target={settings.countdown_target} className="max-w-md" />
            <ul className="flex flex-col gap-2.5 sm:flex-row sm:gap-6">
              <li className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
                {siteConfig.eventDateLabel}
              </li>
              <li className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                {siteConfig.venueShort}
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Layer 3 — CSS-only 3D gyroscope, frozen on low-tier devices */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md lg:flex-1">
          <div className="animate-float-slow">
            <HologramCore />
          </div>
          <div
            aria-hidden="true"
            data-heavy
            className="pointer-events-none absolute inset-x-8 top-0 h-px animate-scan bg-[linear-gradient(90deg,transparent,var(--primary),transparent)]"
          />
        </div>
      </div>

      {/* Scrolling marquee — pure CSS translate, one element */}
      <div className="relative border-y border-border bg-card/50 py-3">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-[marquee_28s_linear_infinite] items-center gap-8 pr-8">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex shrink-0 items-center gap-8">
                {[
                  siteConfig.college,
                  siteConfig.department,
                  siteConfig.club,
                  "11 Events",
                  "Cash Prizes",
                  "Certificates For All",
                ].map((item) => (
                  <span
                    key={`${dup}-${item}`}
                    className="flex shrink-0 items-center gap-8 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
                  >
                    {item}
                    <span className="size-1 rotate-45 bg-primary" aria-hidden="true" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
