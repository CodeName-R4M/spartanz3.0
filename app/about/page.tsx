import type { Metadata } from 'next'
import Link from 'next/link'
import { Crosshair, Eye, Rocket, Shield, Swords, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { getEvents } from '@/lib/data'

export const metadata: Metadata = {
  title: 'About',
  description:
    'What SPARTANZ 3.0 is — the department symposium of CSE — Cyber Security at New Prince Shri Bhavani College of Engineering, organized with RootSec Club.',
}

export default async function AboutPage() {
  const [settings, events, team] = await Promise.all([
    fetchSettings(),
    getEvents({ activeOnly: true }),
    fetchTeam({ activeOnly: true }),
  ])

  const technical = events.filter((e) => e.category === 'technical').length
  const nonTechnical = events.length - technical

  const stats = [
    { label: 'Events', value: events.length },
    { label: 'Technical', value: technical },
    { label: 'Non-Technical', value: nonTechnical },
    { label: 'Crew', value: team.length },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Intro */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="energy-atmos pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {settings.theme}
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl font-extrabold uppercase leading-[0.95] text-foreground sm:text-6xl">
              About {settings.symposiumName}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              {settings.symposiumName} is the {settings.subtitle.toLowerCase()}{' '}
              of the {settings.department} department at {settings.college},
              organized by {settings.club}. A single day where the dimension
              breaks and the arena opens.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-10 text-center">
                <div className="font-display text-4xl font-extrabold text-primary text-glow sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision / Mission */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-8">
              <Eye className="size-7 text-primary" />
              <h2 className="mt-5 font-display text-2xl font-bold uppercase text-foreground">
                Vision
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                To forge a stage where the next generation of cyber-security
                engineers test their skills against real challenges, and to make
                SPARTANZ the defining technical event of the department.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-8">
              <Crosshair className="size-7 text-primary" />
              <h2 className="mt-5 font-display text-2xl font-bold uppercase text-foreground">
                Mission
              </h2>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                Bring students, mentors, and industry minds into one arena
                through competitions, talks, and hands-on battles that reward
                curiosity, resilience, and teamwork.
              </p>
            </div>
          </div>
        </section>

        {/* What to expect */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-balance font-display text-3xl font-extrabold uppercase text-foreground sm:text-4xl">
              What to expect
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Swords,
                  title: 'Technical Battles',
                  body: 'CTFs, hackathons, web-dev sprints, and paper presentations that push your engineering to the edge.',
                },
                {
                  icon: Rocket,
                  title: 'Non-Technical Arena',
                  body: 'Esports, treasure hunts, and quizzes for the strategists who fight with wit and reflex.',
                },
                {
                  icon: Trophy,
                  title: 'Prizes & Glory',
                  body: 'Cash pools, certificates, and campus-wide recognition for the survivors of each event.',
                },
                {
                  icon: Shield,
                  title: 'RootSec Community',
                  body: 'Connect with the club driving cyber-security culture across the department.',
                },
                {
                  icon: Eye,
                  title: 'Industry Exposure',
                  body: 'Real-world problem statements and mentors who have shipped at scale.',
                },
                {
                  icon: Crosshair,
                  title: 'One Timeline',
                  body: 'A single, intense day engineered so every participant gets their moment in the arena.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-background p-6"
                >
                  <item.icon className="size-6 text-primary" />
                  <h3 className="mt-4 font-sans text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance font-display text-3xl font-extrabold uppercase text-foreground sm:text-4xl">
            Ready to enter the arena?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
            {settings.date} • {settings.venue}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-w-48">
              <Link href="/register">Register Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-48 bg-transparent"
            >
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
