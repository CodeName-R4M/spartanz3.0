import { Cpu, Shield, Zap, Globe } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { siteConfig } from '@/lib/site-config'

const pillars = [
  { icon: Shield, title: 'Cyber Focus', desc: 'Rooted in CSE — Cyber Security and driven by the RootSec Club.' },
  { icon: Cpu, title: 'Technical Depth', desc: 'Coding gauntlets, CTF breaches and research showdowns.' },
  { icon: Zap, title: 'High Energy', desc: 'Non-technical events, gaming arenas and pure adrenaline.' },
  { icon: Globe, title: 'Inter-College', desc: 'Warriors from across the region converge for one day.' },
]

export function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The Protocol"
              title="What is Spartanz 3.0?"
              align="left"
            />
            <Reveal delay={0.15}>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
                {siteConfig.event} is the flagship department symposium of{' '}
                <span className="text-foreground">{siteConfig.department}</span> at{' '}
                <span className="text-foreground">{siteConfig.college}</span>, powered by the{' '}
                <span className="text-primary">{siteConfig.club}</span>. Themed around{' '}
                {siteConfig.theme.toLowerCase()}, it fuses cinematic spectacle with serious
                technical competition.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <h4 className="font-display text-sm font-bold tracking-wider text-primary">
                    VISION
                  </h4>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Forge a generation of fearless problem-solvers ready for the digital frontier.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-4">
                  <h4 className="font-display text-sm font-bold tracking-wider text-primary">
                    MISSION
                  </h4>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Unite talent through competition, collaboration and cinematic experience.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <RevealGroup className="grid grid-cols-2 gap-4">
            {pillars.map((p) => (
              <Reveal key={p.title}>
                <div className="group h-full rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40">
                  <span className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h4 className="mt-4 font-display text-base font-bold text-foreground">
                    {p.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
