import Image from 'next/image'
import type { SiteSettings } from '@/lib/types'

interface HomeAboutProps {
  settings: SiteSettings
}

export function HomeAbout({ settings }: HomeAboutProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
          <Image
            src="/about-atmos.png"
            alt={`${settings.symposiumName} atmosphere`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            The Symposium
          </p>
          <h2 className="mt-4 text-balance font-sans text-4xl font-extrabold uppercase leading-tight text-foreground sm:text-5xl">
            When the dimension breaks
          </h2>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            {settings.symposiumName} is the annual department symposium of{' '}
            {settings.department} at {settings.college}, hosted by the{' '}
            {settings.club}. Themed on {settings.theme}, this edition pulls
            together the sharpest minds across technical and non-technical
            arenas for a single day of high-stakes competition.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Capture flags, ship prototypes, decode ciphers, and battle in the
            arena. The timeline is collapsing — assemble your squad before the
            countdown ends.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Date
              </dt>
              <dd className="mt-1 font-sans text-lg font-bold text-foreground">
                {settings.date}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Venue
              </dt>
              <dd className="mt-1 font-sans text-lg font-bold text-foreground">
                {settings.venue}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
