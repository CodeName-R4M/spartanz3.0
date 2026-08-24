'use client'

import { useEffect, useState } from 'react'

function diff(target: number) {
  const now = Date.now()
  const d = Math.max(0, target - now)
  return {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d / 3600000) % 24),
    minutes: Math.floor((d / 60000) % 60),
    seconds: Math.floor((d / 1000) % 60),
  }
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime()
  const [t, setT] = useState(() => diff(target))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setT(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { label: 'DAYS', value: t.days },
    { label: 'HRS', value: t.hours },
    { label: 'MIN', value: t.minutes },
    { label: 'SEC', value: t.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="timer" aria-label="Countdown to Spartanz 3.0">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-[62px] flex-col items-center rounded-lg border border-primary/30 bg-card/60 px-3 py-2 backdrop-blur-sm sm:min-w-[76px] sm:px-4 sm:py-3 box-glow-red">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground text-glow-red sm:text-4xl">
              {mounted ? String(u.value).padStart(2, '0') : '--'}
            </span>
            <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-muted-foreground sm:text-xs">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-display text-xl text-primary/60 sm:text-3xl">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
