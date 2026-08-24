import { Reveal } from '@/components/motion/reveal'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            <span className="h-px w-6 bg-primary" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
