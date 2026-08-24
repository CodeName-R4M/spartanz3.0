import Link from 'next/link'
import { ShieldHalf, Camera, Share2, Globe, PlayCircle, Mail, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

const nav = [
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/teams', label: 'Teams' },
  { href: '/contact', label: 'Contact' },
  { href: '/register', label: 'Register' },
]

const socials = [
  { href: siteConfig.socials.instagram, icon: Camera, label: 'Instagram' },
  { href: siteConfig.socials.linkedin, icon: Share2, label: 'LinkedIn' },
  { href: siteConfig.socials.youtube, icon: PlayCircle, label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-primary/15 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                <ShieldHalf className="size-5" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-wider text-foreground">
                SPARTANZ <span className="text-primary">3.0</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.subtitle} · {siteConfig.theme}
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-muted-foreground">
              <p className="text-foreground/80">{siteConfig.college}</p>
              <p>{siteConfig.department}</p>
              <p>In association with {siteConfig.club}</p>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider text-foreground uppercase">
              Explore
            </h4>
            <ul className="mt-4 space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-bold tracking-wider text-foreground uppercase">
              Connect
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-primary">
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <a href={`tel:${siteConfig.contactPhone}`} className="hover:text-primary">
                  {siteConfig.contactPhone}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-md border border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.event} · {siteConfig.club}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            {siteConfig.theme} — original identity, not affiliated with Marvel.
          </p>
        </div>
      </div>
    </footer>
  )
}
