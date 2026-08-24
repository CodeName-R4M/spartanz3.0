'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { EventCard } from '@/components/event-card'
import { RevealGroup, Reveal } from '@/components/motion/reveal'
import { featuredEvents, type EventCategory } from '@/lib/site-config'
import { cn } from '@/lib/utils'

const filters: ('ALL' | EventCategory)[] = ['ALL', 'TECHNICAL', 'NON-TECHNICAL']

export function FeaturedEvents() {
  const [active, setActive] = useState<'ALL' | EventCategory>('ALL')
  const shown =
    active === 'ALL' ? featuredEvents : featuredEvents.filter((e) => e.category === active)

  return (
    <section id="events" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Arena"
          title="Featured Events"
          description="Technical warfare and non-technical chaos. Choose your battlefield and prepare for doomsday."
        />

        {/* Filters */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={cn(
                  'h-10 rounded-full border px-5 text-xs font-semibold tracking-wide transition-all',
                  active === f
                    ? 'border-primary bg-primary text-primary-foreground box-glow-red'
                    : 'border-border bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        <RevealGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <Reveal key={e.slug}>
              <EventCard event={e} />
            </Reveal>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-center">
          <Link
            href="/events"
            className="group inline-flex h-12 items-center gap-2 rounded-md border border-primary/40 px-7 text-sm font-semibold text-foreground transition-all hover:bg-primary/10"
          >
            View All Events
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
