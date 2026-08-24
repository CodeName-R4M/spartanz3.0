import { SectionHeading } from './section-heading'
import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { timeline } from '@/lib/site-config'

export function TimelineSection() {
  return (
    <section className="relative border-y border-primary/10 bg-card/20 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Battle Schedule" title="Event Timeline" />

        <RevealGroup className="relative mt-12">
          {/* vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent sm:left-1/2" />

          <ul className="space-y-6">
            {timeline.map((t, i) => (
              <Reveal as="li" key={t.time}>
                <div
                  className={`relative flex items-start gap-4 sm:w-1/2 ${
                    i % 2 === 0 ? 'sm:ml-auto sm:flex-row-reverse sm:pl-8 sm:text-right' : 'sm:pr-8'
                  }`}
                >
                  <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-primary box-glow-red sm:absolute sm:left-0 sm:top-0 sm:-translate-x-1/2 sm:translate-x-0">
                    <span className="size-2.5 rounded-full bg-primary" />
                  </span>
                  <div className="flex-1 rounded-xl border border-border bg-card/60 p-4">
                    <span className="font-display text-sm font-bold tracking-wider text-primary">
                      {t.time}
                    </span>
                    <h4 className="mt-1 font-display text-base font-bold text-foreground">
                      {t.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  )
}
