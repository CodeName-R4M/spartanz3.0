import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, MapPin, Ticket, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { getCurrentUser } from '@/lib/session'
import { fetchEvents, fetchMyRegistrations } from '@/lib/data'

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Your SPARTANZ 3.0 registrations.',
}

const STATUS_LABEL: Record<string, string> = {
  registered: 'Registered',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  attended: 'Attended',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/dashboard')

  const [regs, events] = await Promise.all([
    fetchMyRegistrations(user.id),
    fetchEvents(),
  ])
  const eventById = new Map(events.map((e) => [e.id, e]))

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] pt-16">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              Command Center
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold uppercase text-foreground">
              Welcome, {user.name.split(' ')[0]}
            </h1>
            <p className="mt-2 text-muted-foreground">
              You have {regs.length} registration{regs.length === 1 ? '' : 's'}.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {regs.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Ticket className="mx-auto size-10 text-primary" />
              <h2 className="mt-5 font-display text-xl font-bold uppercase text-foreground">
                No registrations yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-pretty text-muted-foreground">
                Browse the arena and lock in your first event.
              </p>
              <Button asChild className="mt-6">
                <Link href="/events">Explore events</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {regs.map((reg) => {
                const event = eventById.get(reg.eventId)
                return (
                  <div
                    key={reg.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-lg font-bold text-foreground">
                          {event?.name ?? 'Event'}
                        </h3>
                        <Badge
                          variant={
                            reg.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {STATUS_LABEL[reg.status] ?? reg.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                        {event ? (
                          <>
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="size-3.5 text-primary" />
                              {event.date}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary" />
                              {event.venue}
                            </span>
                          </>
                        ) : null}
                        {reg.teamName ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5 text-primary" />
                            {reg.teamName} ({reg.members.length + 1})
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {event ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="shrink-0 bg-transparent"
                      >
                        <Link href={`/events/${event.slug}`}>View event</Link>
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
