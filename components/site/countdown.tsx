"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

function diff(target: number) {
  const ms = Math.max(target - Date.now(), 0)
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  }
}

/**
 * One setInterval at 1Hz — the cheapest possible live counter.
 * Renders zeros on the server so hydration never mismatches.
 */
export function Countdown({ target, className }: { target: string; className?: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false })

  useEffect(() => {
    const ts = new Date(target).getTime()
    setTime(diff(ts))
    const id = setInterval(() => setTime(diff(ts)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ]

  return (
    <div className={cn("flex items-stretch gap-2 sm:gap-3", className)}>
      {units.map((u) => (
        <div
          key={u.label}
          className="clip-notch metal flex min-w-[62px] flex-1 flex-col items-center border border-border bg-card/70 px-2 py-2.5 sm:min-w-[76px] sm:px-3"
        >
          <span className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}
