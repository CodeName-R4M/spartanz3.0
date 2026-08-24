"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, ShieldHalf, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NAV_LINKS, siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  // Passive scroll listener, throttled to one state flip per threshold cross.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setSolid(window.scrollY > 24)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "border-b border-border bg-background/85 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="clip-notch metal flex size-9 items-center justify-center border border-primary/40 bg-card">
            <ShieldHalf className="size-5 text-primary" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-[0.18em] text-foreground">
              {siteConfig.symposium}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {siteConfig.department}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-primary shadow-[0_0_10px_var(--glow)]"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden font-mono text-xs uppercase sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="clip-notch hidden font-mono text-xs uppercase tracking-[0.14em] sm:inline-flex"
          >
            <Link href="/register">Register</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="clip-notch flex size-9 items-center justify-center border border-border bg-card text-foreground md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t border-border bg-background md:hidden">
          <ul className="mx-auto flex w-full max-w-7xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border-b border-border/60 py-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-2 pt-4">
              <Button asChild variant="outline" size="sm" className="flex-1 font-mono text-xs uppercase">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 font-mono text-xs uppercase">
                <Link href="/register">Register</Link>
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
