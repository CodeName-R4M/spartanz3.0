import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { siteConfig } from "@/lib/site-config"

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border py-20 lg:py-28">
      <div className="hud-grid absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_100%,oklch(0.552_0.215_22/14%),transparent_70%)]"
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Enlist</span>
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-6 font-display text-3xl font-black uppercase leading-[1.02] tracking-tight text-balance sm:text-5xl">
            The countdown does not wait
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
            {siteConfig.tagline} Seats per event are limited and allotted in registration order — pick your events and
            lock your slot.
          </p>
        </Reveal>

        <Reveal delay={160} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="clip-notch group font-mono text-xs uppercase tracking-[0.18em]">
            <Link href="/register">
              Register For Events
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="clip-notch bg-card/50 font-mono text-xs uppercase tracking-[0.18em]"
          >
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.mapsQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="mr-1 size-4" />
              Reach The Venue
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
