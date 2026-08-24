import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Users } from 'lucide-react'
import type { EventItem } from '@/lib/types'

interface EventCardProps {
  event: EventItem
}

export function EventCard({ event }: EventCardProps) {
  const teamLabel =
    event.teamSize.min === event.teamSize.max
      ? event.teamSize.min === 1
        ? 'Solo'
        : `${event.teamSize.min} members`
      : `${event.teamSize.min}-${event.teamSize.max} members`

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.image || '/placeholder.svg'}
          alt={event.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-primary/30 bg-background/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur">
          {event.category === 'technical' ? 'Technical' : 'Non-Technical'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-pretty font-sans text-xl font-bold text-foreground">
          {event.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {event.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-primary" />
            {event.startTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            {teamLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            {event.venue}
          </span>
        </div>
      </div>
    </Link>
  )
}
