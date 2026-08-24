import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/events/event-card"
import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import type { SymposiumEvent } from "@/lib/types"

export function FeaturedEvents({ events }: { events: SymposiumEvent[] }) {
  if (events.length === 0) return null

  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Flagship Events"
            title="Pick your battlefield"
            description="Six flagship arenas headline the day. Every event below has a full rulebook, coordinator contact and its own registration desk."
          />
          <Reveal delay={120}>
            <Button asChild variant="outline" className="clip-notch font-mono text-xs uppercase tracking-[0.16em]">
              <Link href="/events">
                All 11 Events
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <Reveal as="li" key={event.id} delay={Math.min(i, 3) * 90} variant="scale" className="h-full">
              <EventCard event={event} priority={i < 3} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
