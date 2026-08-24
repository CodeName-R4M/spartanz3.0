import Link from 'next/link'
import { ArrowRight, User } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { teamPreview } from '@/lib/site-config'

export function TeamsPreview() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Order"
          title="Meet the Spartans"
          description="The minds and hands behind Spartanz 3.0 — faculty, organizers and volunteers."
        />

        <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {teamPreview.map((m) => (
            <Reveal key={m.name}>
              <div className="group rounded-xl border border-border bg-card/50 p-5 text-center transition-colors hover:border-primary/40">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/30 bg-gradient-to-br from-secondary to-background text-primary transition-transform duration-300 group-hover:scale-105 sm:size-20">
                  <User className="size-7 sm:size-9" />
                </div>
                <h4 className="mt-4 font-display text-sm font-bold text-foreground sm:text-base">
                  {m.name}
                </h4>
                <p className="mt-1 text-xs text-primary">{m.role}</p>
                <p className="mt-0.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                  {m.category}
                </p>
              </div>
            </Reveal>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-center">
          <Link
            href="/teams"
            className="group inline-flex h-12 items-center gap-2 rounded-md border border-primary/40 px-7 text-sm font-semibold text-foreground transition-all hover:bg-primary/10"
          >
            Meet the Full Team
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
