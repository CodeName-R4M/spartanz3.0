import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Hero } from '@/components/site/hero'
import { HomeAbout } from '@/components/site/home-about'
import { EventCard } from '@/components/site/event-card'
import { fetchEvents, fetchSettings } from '@/lib/data'

export default async function Page() {
  const [settings, events] = await Promise.all([
    fetchSettings(),
    fetchEvents({ activeOnly: true }),
  ])
  const featured = events.slice(0, 6)

  return (
    <>
      <Navbar />
      <main>
        <Hero settings={settings} />
        <HomeAbout settings={settings} />

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                The Arena
              </p>
              <h2 className="mt-4 text-balance font-sans text-4xl font-extrabold uppercase leading-tight text-foreground sm:text-5xl">
                Featured Events
              </h2>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-primary"
            >
              <Link href="/events">
                View all events
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-border">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
            <h2 className="text-balance font-sans text-4xl font-extrabold uppercase leading-tight text-foreground sm:text-6xl">
              The clock is ticking
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Registrations for {settings.symposiumName} are{' '}
              {settings.registrationOpen ? 'open' : 'closing soon'}. Assemble
              your team and claim your place in the arena.
            </p>
            <Button asChild size="lg" className="mt-10 min-w-56 text-base">
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
