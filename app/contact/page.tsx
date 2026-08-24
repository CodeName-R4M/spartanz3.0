import type { Metadata } from 'next'
import { Mail, MapPin, Phone, Building2 } from 'lucide-react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ContactForm } from '@/components/site/contact-form'
import { fetchSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the SPARTANZ 3.0 team — RootSec Club, CSE — Cyber Security, New Prince Shri Bhavani College of Engineering.',
}

export default async function ContactPage() {
  const settings = await fetchSettings()

  const info = [
    { icon: Building2, label: 'Department', value: settings.department },
    { icon: MapPin, label: 'Venue', value: settings.venue },
    { icon: Mail, label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: Phone, label: 'Phone', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
  ]

  const mapsQuery = encodeURIComponent(`${settings.college}`)

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="relative overflow-hidden border-b border-border">
          <div className="hud-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
              {settings.club}
            </p>
            <h1 className="mt-4 text-balance font-display text-5xl font-extrabold uppercase leading-[0.95] text-foreground sm:text-6xl">
              Contact
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
              Questions about {settings.symposiumName}? Reach the organizing
              team directly or send a message below.
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          {/* Info + map */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <item.icon className="size-5 text-primary" />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block break-words text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 break-words text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {settings.socials.length > 0 ? (
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Social
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title="Campus location"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-6 font-display text-2xl font-bold uppercase text-foreground">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
