'use client'

import { useMemo, useState } from 'react'
import { EventCard } from './event-card'
import type { EventCategory, EventItem } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EventsBrowserProps {
  events: EventItem[]
  categories: EventCategory[]
}

export function EventsBrowser({ events, categories }: EventsBrowserProps) {
  const [active, setActive] = useState<string>('all')

  const filters = useMemo(
    () => [{ slug: 'all', name: 'All Events' }, ...categories],
    [categories],
  )

  const filtered = useMemo(
    () =>
      active === 'all'
        ? events
        : events.filter((e) => e.category === active),
    [active, events],
  )

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => setActive(f.slug)}
            className={cn(
              'rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors',
              active === f.slug
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {f.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center font-mono text-sm text-muted-foreground">
          No events in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
