'use client'

import Link from 'next/link'
import { useRef, type PointerEvent } from 'react'
import { ArrowUpRight, MapPin, Users, Trophy, CalendarDays } from 'lucide-react'
import type { EventPreview } from '@/lib/site-config'
import { cn } from '@/lib/utils'

export function EventCard({ event }: { event: EventPreview }) {
  const ref = useRef<HTMLDivElement>(null)

  // Subtle 3D tilt — pointer only, so touch devices are unaffected.
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`
  }
  function reset() {
    if (ref.current) ref.current.style.transform = ''
  }

  const isTech = event.category === 'TECHNICAL'

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="group relative h-full rounded-xl border border-border bg-card/60 p-5 transition-[transform,border-color,box-shadow] duration-200 will-change-transform hover:border-primary/50 hover:box-glow-red"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Visual header (generated-art placeholder via CSS energy field) */}
      <div className="relative mb-4 h-36 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-secondary to-background">
        <div className="absolute inset-0 hud-grid opacity-30" />
        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/25 blur-2xl transition-transform duration-300 group-hover:scale-125" />
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider',
              isTech
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-accent/40 bg-accent/15 text-accent',
            )}
          >
            {event.category}
          </span>
        </div>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-[10px] font-semibold text-foreground/90 backdrop-blur-sm">
          <CalendarDays className="size-3 text-primary" />
          {event.date}
        </span>
      </div>

      <h3 className="font-display text-xl font-bold text-foreground">{event.name}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {event.shortDescription}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="inline-flex items-center gap-1.5">
          <Users className="size-3.5 text-primary/80" /> {event.teamSize}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-primary/80" /> {event.venue}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Trophy className="size-3.5 text-primary/80" /> {event.prize}
        </div>
        <div className="inline-flex items-center gap-1.5 font-semibold text-foreground/90">
          {event.fee}
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-primary/30 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10"
        >
          View Details
        </Link>
        <Link
          href={`/register?event=${event.slug}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-md bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Register <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
