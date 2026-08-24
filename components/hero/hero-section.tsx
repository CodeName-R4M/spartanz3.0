'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, CalendarDays, MapPin, ChevronDown } from 'lucide-react'
import PortalCanvas from './portal-canvas'
import { Countdown } from './countdown'
import { siteConfig } from '@/lib/site-config'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
      <PortalCanvas />

      {/* HUD grid + scanline overlays */}
      <div className="pointer-events-none absolute inset-0 -z-[5] hud-grid radial-fade opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-32 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-[4] overflow-hidden">
        <div className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        {/* Theme badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card/50 px-4 py-1.5 text-[10px] font-medium tracking-[0.22em] text-primary backdrop-blur-sm sm:text-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {siteConfig.theme}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 font-display text-6xl font-black leading-[0.95] tracking-tight text-foreground text-glow-red text-balance sm:text-8xl lg:text-9xl"
        >
          SPARTANZ
          <span className="mt-1 block text-primary">3.0</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 font-display text-sm font-semibold tracking-[0.35em] text-muted-foreground sm:text-lg"
        >
          {siteConfig.subtitle}
        </motion.p>

        {/* Institutional info — small, supporting */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-4 flex flex-col items-center gap-1 text-xs text-muted-foreground/90 sm:text-sm"
        >
          <p className="font-medium text-foreground/80">{siteConfig.department}</p>
          <p>{siteConfig.college}</p>
          <p className="text-muted-foreground/70">In association with {siteConfig.club}</p>
        </motion.div>

        {/* Date + venue chips */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-foreground/90 backdrop-blur-sm">
            <CalendarDays className="size-3.5 text-primary" />
            {siteConfig.eventDateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs text-foreground/90 backdrop-blur-sm">
            <MapPin className="size-3.5 text-primary" />
            {siteConfig.venue}
          </span>
        </motion.div>

        {/* Countdown */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className="mt-8">
          <Countdown date={siteConfig.eventDate} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/register"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-semibold tracking-wide text-primary-foreground transition-all hover:bg-primary/85 box-glow-red sm:w-auto"
          >
            REGISTER NOW
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/events"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-primary/40 bg-card/30 px-8 text-sm font-semibold tracking-wide text-foreground backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/10 sm:w-auto"
          >
            EXPLORE EVENTS
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="size-6 animate-bounce text-primary/70" />
      </motion.div>
    </section>
  )
}
