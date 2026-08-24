import type { Metadata } from 'next'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { TeamMemberCard } from '@/components/site/team-member-card'
import { fetchTeam } from '@/lib/data'
import { TEAM_CATEGORIES } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Teams',
  description:
    'The people powering SPARTANZ 3.0 — faculty coordinators, organizing committee, and the RootSec Club crews behind the symposium.',
}

export default async function TeamsPage() {
  const team = await fetchTeam({ activeOnly: true })

  const groups = TEAM_CATEGORIES.map((cat) => ({
    ...cat,
    members: team
      .filter((m) => m.category === cat.slug)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  })).filter((g) => g.members.length > 0)

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="energy-atmos pointer-events-none absolute inset-0" />
          <div className="hud-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              RootSec Club
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl font-extrabold uppercase leading-[0.95] text-foreground sm:text-6xl">
              The Crew
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground">
              SPARTANZ 3.0 is assembled by the students and faculty of the CSE —
              Cyber Security department. Meet the people behind the arena.
            </p>
          </div>
        </section>

        {groups.length === 0 ? (
          <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
            <p className="font-mono text-sm text-muted-foreground">
              The team roster is being assembled. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            {groups.map((group) => (
              <section key={group.slug} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4">
                  <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
                    {group.label}
                  </h2>
                  <span className="h-px flex-1 bg-border" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {group.members.length}
                  </span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {group.members.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
