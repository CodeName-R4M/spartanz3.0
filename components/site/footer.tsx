import Link from "next/link"
import {
  Mail,
  MapPin,
  Phone,
  ShieldHalf,
} from "lucide-react"
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa"
import { NAV_LINKS, siteConfig } from "@/lib/site-config"

const socials = [
  { href: siteConfig.socials.instagram, label: "Instagram", Icon: FaInstagram },
  { href: siteConfig.socials.linkedin, label: "LinkedIn", Icon: FaLinkedinIn },
  { href: siteConfig.socials.github, label: "GitHub", Icon: FaGithub },
  { href: siteConfig.socials.youtube, label: "YouTube", Icon: FaYoutube },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/40">
      <div className="hud-grid absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="clip-notch metal flex size-10 items-center justify-center border border-primary/40 bg-card">
                <ShieldHalf className="size-5 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-base font-bold tracking-[0.16em]">{siteConfig.event}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {siteConfig.eventDateLabel}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{siteConfig.subtitle}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              {siteConfig.club} · {siteConfig.department}
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:max-w-2xl">
            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Navigate</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Participate</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li>
                  <Link href="/register" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Participant Login
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Event Rulebook
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    Organiser Console
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Reach Us</h2>
              <ul className="mt-4 flex flex-col gap-3">
                <li className="flex gap-2.5 text-sm text-foreground/80">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href={`mailto:${siteConfig.contactEmail}`} className="break-all hover:text-primary">
                    {siteConfig.contactEmail}
                  </a>
                </li>
                <li className="flex gap-2.5 text-sm text-foreground/80">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <a href={`tel:${siteConfig.contactPhone.replace(/\s/g, "")}`} className="hover:text-primary">
                    {siteConfig.contactPhone}
                  </a>
                </li>
                <li className="flex gap-2.5 text-sm leading-relaxed text-foreground/80">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{siteConfig.venue}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.club} · {siteConfig.college}
          </p>
          <ul className="flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clip-notch flex size-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
