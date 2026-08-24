import Link from "next/link"
import { ArrowRight, Cpu, Radar, ShieldHalf, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { TiltCard } from "@/components/motion/tilt-card"
import { SectionHeading } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

const pillars = [
  {
    Icon: ShieldHalf,
    title: "Defend",
    body: "Blue-team drills, forensics and hardening challenges built by the club's security wing.",
  },
  {
    Icon: Cpu,
    title: "Build",
    body: "Timed engineering sprints where working software beats slide decks, every round.",
  },
  {
    Icon: Radar,
    title: "Break",
    body: "Guided offensive labs on isolated targets — no production systems, no grey areas.",
  },
  {
    Icon: Trophy,
    title: "Win",
    body: "Cash prizes across all eleven events, plus certificates for every finalist.",
  },
]

export function AboutPreview() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:gap-16 lg:px-8">
        <div className="lg:max-w-md">
          <SectionHeading
            eyebrow="Briefing"
            title="A symposium built like an operation"
            description={`${siteConfig.club} runs ${siteConfig.symposium} as one continuous day of engineering pressure — eleven events, one campus, and a scoreboard that never stops moving.`}
          />
          <Reveal delay={120} className="mt-8 flex flex-col gap-6">
            <p className="border-l-2 border-primary/60 pl-4 text-sm leading-relaxed text-muted-foreground text-pretty">
              Hosted by the {siteConfig.department} at {siteConfig.college}, the symposium brings together students
              from across the state for a single day of technical and non-technical competition — designed, judged and
              operated entirely by students.
            </p>
            <Button asChild variant="outline" className="clip-notch w-fit font-mono text-xs uppercase tracking-[0.16em]">
              <Link href="/about">
                Full Briefing
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <ul className="grid flex-1 gap-4 sm:grid-cols-2">
          {pillars.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80} className="h-full">
              <TiltCard max={5} className="group h-full">
                <div className="clip-notch flex h-full flex-col gap-3 border border-border bg-card/70 p-6 transition-colors duration-300 group-hover:border-primary/45">
                  <span className="flex size-10 items-center justify-center border border-primary/35 bg-primary/10">
                    <p.Icon className="size-5 text-primary" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-bold uppercase tracking-wide">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{p.body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
