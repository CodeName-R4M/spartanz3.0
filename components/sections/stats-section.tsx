'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { eventStats } from '@/lib/site-config'

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const dur = 1200
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])

  return (
    <span ref={ref} className="font-display text-4xl font-black text-foreground text-glow-red sm:text-5xl">
      {n}
      {suffix}
    </span>
  )
}

export function StatsSection() {
  return (
    <section className="relative border-y border-primary/10 bg-card/30 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {eventStats.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <CountUp value={s.value} suffix={s.suffix} />
            <span className="mt-2 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase sm:text-sm">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
