import { SectionHeading } from './section-heading'
import { Reveal, RevealGroup } from '@/components/motion/reveal'

// TEMPLATE sponsors — replace with real partners later.
const sponsors = ['TITLE SPONSOR', 'TECH PARTNER', 'MEDIA PARTNER', 'GAMING PARTNER', 'FOOD PARTNER', 'COMMUNITY']

export function SponsorsSection() {
  return (
    <section className="relative border-t border-primary/10 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Allied Forces" title="Our Sponsors" />
        <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((s) => (
            <Reveal key={s}>
              <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-card/40 px-3 text-center text-[10px] font-semibold tracking-wider text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:text-xs">
                {s}
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
