import { Reveal } from "@/components/motion/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { siteConfig } from "@/lib/site-config"

export function Timeline() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Run Sheet"
          title="One day, start to finish"
          description={`Everything below happens on ${siteConfig.eventDateLabel}. Report to the registration desk before the first slot closes.`}
        />

        <ol className="mt-12 flex flex-col">
          {siteConfig.schedule.map((slot, i) => (
            <Reveal
              as="li"
              key={slot.time}
              delay={i * 60}
              className="group relative flex gap-5 border-t border-border py-6 last:border-b sm:gap-10"
            >
              <span className="w-16 shrink-0 pt-0.5 font-mono text-xs uppercase tracking-[0.14em] text-primary sm:w-24 sm:text-sm">
                {slot.time}
              </span>
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rotate-45 border border-primary/60 bg-background transition-colors duration-300 group-hover:bg-primary"
              />
              <div className="flex-1">
                <h3 className="font-display text-base font-bold uppercase tracking-wide sm:text-lg">{slot.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{slot.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
