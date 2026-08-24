import type { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { EventsBrowser } from '@/components/site/events-browser'
import { fetchCategories, fetchEvents, fetchSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Explore the technical and non-technical events at the SPARTANZ 3.0 symposium.',
}

export default async function EventsPage() {
  const [settings, events, categories] = await Promise.all([
    fetchSettings(),
    fetchEvents({ activeOnly: true }),
    fetchCategories({ activeOnly: true }),
  ])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        <header className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            The Arena
          </p>
          <h1 className="mt-4 text-balance font-sans text-5xl font-extrabold uppercase leading-none text-foreground sm:text-7xl">
            Events
          </h1>
          <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {events.length} battles across technical and non-technical arenas at{' '}
            {settings.symposiumName}. Pick your fight, assemble your squad, and
            register before the countdown ends.
          </p>
        </header>

        <EventsBrowser events={events} categories={categories} />
      </main>
      <Footer />
    </>
  )
}
