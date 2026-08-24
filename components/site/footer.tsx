import Link from 'next/link'
import { Shield } from 'lucide-react'
import { fetchSettings } from '@/lib/data'

export async function Footer() {
  const settings = await fetchSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-primary">
                <Shield className="size-4" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-[0.18em]">
                SPARTANZ<span className="text-primary"> 3.0</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              {settings.subtitle} of the {settings.department} department,{' '}
              {settings.college}. Organized with {settings.club}.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {settings.date} • {settings.venue}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-foreground">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { href: '/events', label: 'Events' },
                { href: '/about', label: 'About' },
                { href: '/teams', label: 'Teams' },
                { href: '/contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-foreground">
              Connect
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {settings.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {settings.contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {settings.symposiumName}. All rights reserved.
          </p>
          <p className="tracking-wide">
            Built by {settings.club} • {settings.department}
          </p>
        </div>
      </div>
    </footer>
  )
}
