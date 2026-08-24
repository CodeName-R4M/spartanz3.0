import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock, MapPin, Users } from "lucide-react"
import { TiltCard } from "@/components/motion/tilt-card"
import type { EventItem } from "@/lib/types"

function teamLabel(event: EventItem) {
  if (event.teamSize.max <= 1) return "Solo"
  if (event.teamSize.min === event.teamSize.max) return `Team of ${event.teamSize.max}`
  return `Team ${event.teamSize.min}–${event.teamSize.max}`
}

export function EventCard({ event, priority = false }: { event: EventItem; priority?: boolean }) {
  return (
    <TiltCard className="group h-full">
      <article className="clip-plate metal flex h-full flex-col border border-border bg-card transition-colors duration-300 group-hover:border-primary/50">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={event.image || "/events/generic-technical.png"}
            alt={event.name}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--card),transparent_62%)]" />
          <span className="absolute left-3 top-3 border border-primary/40 bg-background/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
            {event.category === 'technical' ? 'Technical' : event.category === 'non-technical' ? 'Non-Technical' : 'Event'}
          </span>
          {event.featured && (
            <span className="absolute right-3 top-3 bg-primary px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-primary-foreground">
              Flagship
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-tight text-balance">
              {event.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              {event.shortDescription}
            </p>
          </div>

          <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Clock className="size-3 text-primary" aria-hidden="true" />
              {event.startTime}
            </li>
            <li className="flex items-center gap-1.5">
              <Users className="size-3 text-primary" aria-hidden="true" />
              {teamLabel(event)}
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{event.venue}</span>
            </li>
          </ul>

          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-sm font-bold text-foreground">
              {event.registrationFee > 0 ? `₹${event.registrationFee}` : "Free Entry"}
            </span>
            <Link
              href={`/events/${event.slug}`}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary transition-colors hover:text-foreground"
            >
              View Brief
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only">for {event.name}</span>
            </Link>
          </div>
        </div>
      </article>
    </TiltCard>
  )
}
