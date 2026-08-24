import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  Trophy,
  Users,
} from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Button } from '@/components/ui/button'
import { fetchEventBySlug, fetchEvents } from '@/lib/data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event) return { title: 'Event not found' }
  return {
    title: event.name,
    description: event.shortDescription,
    openGraph: { images: [event.image] },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event || event.status !== 'active') notFound()

  const teamLabel =
    event.teamSize.min === event.teamSize.max
      ? event.teamSize.min === 1
        ? 'Solo entry'
        : `Teams of ${event.teamSize.min}`
      : `Teams of ${event.teamSize.min}-${event.teamSize.max}`

  const facts = [
    { icon: CalendarDays, label: 'Date', value: event.date },
    {
      icon: Clock,
      label: 'Time',
      value: `${event.startTime} - ${event.endTime}`,
    },
    { icon: MapPin, label: 'Venue', value: event.venue },
    { icon: Users, label: 'Team Size', value: teamLabel },
    {
      icon: IndianRupee,
      label: 'Registration Fee',
      value: event.registrationFee === 0 ? 'Free' : `₹${event.registrationFee}`,
    },
    { icon: Trophy, label: 'Prizes', value: event.prizes },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero banner */}
        <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden">
          <Image
            src={event.image || '/placeholder.svg'}
            alt={event.name}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/30"
          />
          <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-32 sm:px-6">
            <Link
              href="/events"
              className="font-mono text-xs uppercase tracking-[0.2em] text-primary hover:underline"
            >
              ← All events
            </Link>
            <span className="mt-4 block font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {event.category === 'technical' ? 'Technical' : 'Non-Technical'}
            </span>
            <h1 className="mt-2 text-balance font-sans text-5xl font-extrabold uppercase leading-none text-foreground sm:text-7xl">
              {event.name}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
              {event.shortDescription}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="font-sans text-2xl font-bold text-foreground">
                About the event
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                {event.description}
              </p>

              <h2 className="mt-12 font-sans text-2xl font-bold text-foreground">
                Rules & Guidelines
              </h2>
              <ul className="mt-4 space-y-3">
                {event.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-pretty leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-0.5 font-mono text-sm font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {rule}
                  </li>
                ))}
              </ul>

              <div className="mt-12 rounded-lg border border-border bg-card p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Event Coordinator
                </p>
                <p className="mt-2 font-sans text-lg font-bold text-foreground">
                  {event.coordinator.name}
                </p>
                <a
                  href={`tel:${event.coordinator.phone}`}
                  className="mt-1 inline-flex items-center gap-2 font-mono text-sm text-primary hover:underline"
                >
                  <Phone className="size-3.5" />
                  {event.coordinator.phone}
                </a>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-6">
                <dl className="space-y-5">
                  {facts.map((f) => (
                    <div key={f.label} className="flex gap-3">
                      <f.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {f.label}
                        </dt>
                        <dd className="mt-0.5 text-pretty text-sm font-medium text-foreground">
                          {f.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
                <Button asChild size="lg" className="mt-6 w-full">
                  <Link href={`/register?event=${event.slug}`}>
                    Register for this event
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
