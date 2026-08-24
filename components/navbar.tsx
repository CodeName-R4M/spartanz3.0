'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X, ShieldHalf } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/teams', label: 'Teams' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-primary/15 bg-background/80 backdrop-blur-xl'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Spartanz 3.0 home">
          <span className="flex size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary box-glow-red">
            <ShieldHalf className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-wider text-foreground">
              SPARTANZ <span className="text-primary">3.0</span>
            </span>
            <span className="mt-0.5 text-[9px] font-medium tracking-[0.18em] text-muted-foreground">
              {siteConfig.department} · {siteConfig.club.toUpperCase()}
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/85 box-glow-red"
          >
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-11 items-center justify-center rounded-md border border-primary/25 bg-card/50 text-foreground md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden overflow-hidden border-t border-primary/10 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300',
          open ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex h-12 items-center rounded-md px-3 text-base font-medium text-foreground/90 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center rounded-md border border-primary/30 text-sm font-semibold text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground box-glow-red"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
