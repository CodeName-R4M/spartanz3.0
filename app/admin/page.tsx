import {
  CalendarRange,
  CheckCircle2,
  Layers,
  Ticket,
  UsersRound,
  Users,
} from 'lucide-react'
import { StatCard } from '@/components/admin/stat-card'
import { BarList } from '@/components/admin/bar-list'
import {
  getEvents,
  fetchRegistrations,
  fetchTeam,
  fetchUsers,
} from '@/lib/data'

export default async function AdminOverviewPage() {
  const [events, registrations, users, team] = await Promise.all([
    getEvents(),
    fetchRegistrations(),
    fetchUsers(),
    fetchTeam(),
  ])

  const eventById = new Map(events.map((e) => [e.id, e]))
  const active = registrations.filter((r) => r.status !== 'cancelled')

  const technicalRegs = active.filter(
    (r) => eventById.get(r.eventId)?.category === 'technical',
  ).length
  const nonTechnicalRegs = active.length - technicalRegs

  // Event popularity (top by active registrations).
  const popularity = events
    .map((e) => ({
      label: e.name,
      value: active.filter((r) => r.eventId === e.id).length,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Registration trend over the last 7 days.
  const trend = Array.from({ length: 7 }).map((_, idx) => {
    const day = new Date()
    day.setDate(day.getDate() - (6 - idx))
    const key = day.toISOString().slice(0, 10)
    const count = registrations.filter(
      (r) => r.createdAt.slice(0, 10) === key,
    ).length
    return {
      label: day.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
      }),
      value: count,
    }
  })

  const recent = [...registrations]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Command Center
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
          Overview
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Regs"
          value={registrations.length}
          icon={Ticket}
          accent
        />
        <StatCard label="Technical" value={technicalRegs} icon={Layers} />
        <StatCard
          label="Non-Technical"
          value={nonTechnicalRegs}
          icon={Layers}
        />
        <StatCard
          label="Active Events"
          value={events.filter((e) => e.status === 'active').length}
          icon={CalendarRange}
        />
        <StatCard label="Users" value={users.length} icon={Users} />
        <StatCard label="Crew" value={team.length} icon={UsersRound} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Event Popularity
          </h2>
          <div className="mt-5">
            <BarList items={popularity} emptyLabel="No registrations yet." />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Registrations · Last 7 Days
          </h2>
          <div className="mt-5">
            <BarList items={trend} />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
          Recent Registrations
        </h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center font-mono text-sm text-muted-foreground">
            No registrations yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recent.map((reg) => (
              <li
                key={reg.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {reg.fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {eventById.get(reg.eventId)?.name ?? 'Event'}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {reg.status === 'cancelled' ? null : (
                    <CheckCircle2 className="size-3.5 text-primary" />
                  )}
                  {reg.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
