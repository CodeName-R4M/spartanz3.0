'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  target: string
}

function diff(target: number) {
  const total = Math.max(0, target - Date.now())
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((total / (1000 * 60)) % 60)
  const seconds = Math.floor((total / 1000) % 60)
  return { days, hours, minutes, seconds, total }
}

export function Countdown({ target }: CountdownProps) {
  const targetMs = new Date(target).getTime()
  const [time, setTime] = useState(() => diff(targetMs))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTime(diff(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ]

  if (time.total <= 0 && mounted) {
    return (
      <p className="font-mono text-lg uppercase tracking-[0.3em] text-primary">
        The battle has begun
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl font-extrabold tabular-nums text-foreground sm:text-5xl">
              {mounted ? String(u.value).padStart(2, '0') : '--'}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl font-bold text-primary/40 sm:text-4xl">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
