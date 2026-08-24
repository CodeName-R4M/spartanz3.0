import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { RegisterForm } from '@/components/site/register-form'
import { fetchEvents, fetchSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Register',
  description:
    'Register for SPARTANZ 3.0 events — secure your place in the arena.',
}

export default async function RegisterPage() {
  const [settings, events] = await Promise.all([
    fetchSettings(),
    fetchEvents({ activeOnly: true }),
  ])

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="energy-atmos pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {settings.registrationOpen ? 'Registration Open' : 'Registration Closing Soon'}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold uppercase leading-[0.95] text-foreground sm:text-5xl">
              Enter the Arena
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Pick your event, assemble your team, and lock in your place at{' '}
              {settings.symposiumName}.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {events.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center font-mono text-sm text-muted-foreground">
              No events are open for registration yet.
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="rounded-lg border border-border bg-card p-8 text-center font-mono text-sm text-muted-foreground">
                  Loading…
                </div>
              }
            >
              <RegisterForm events={events} />
            </Suspense>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
