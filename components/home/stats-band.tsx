import { Reveal } from "@/components/motion/reveal"

interface StatsBandProps {
  stats: { events: number; registrations: number; teamMembers: number; colleges: number }
}

export function StatsBand({ stats }: StatsBandProps) {
  const items = [
    { value: stats.events, label: "Events", suffix: "" },
    { value: stats.registrations, label: "Registrations", suffix: "+" },
    { value: stats.colleges, label: "Colleges Invited", suffix: "" },
    { value: stats.teamMembers, label: "Crew Members", suffix: "" },
  ]

  return (
    <section className="border-y border-border bg-card/30" aria-label="Symposium in numbers">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item, i) => (
          <Reveal
            key={item.label}
            delay={i * 70}
            className="flex flex-col gap-1 border-l border-border py-8 pl-5 first:border-l-0 lg:py-10"
          >
            <span className="font-display text-3xl font-black tabular-nums text-primary sm:text-4xl">
              {item.value}
              {item.suffix}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {item.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
