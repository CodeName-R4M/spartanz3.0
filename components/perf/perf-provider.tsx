"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type PerfTier = "high" | "medium" | "low"

interface PerfState {
  tier: PerfTier
  /** Heavy visuals (canvas particle field, big blurs) allowed. */
  allowHeavy: boolean
  /** Pointer-driven 3D parallax allowed. */
  allowParallax: boolean
  reducedMotion: boolean
  ready: boolean
}

const PerfContext = createContext<PerfState>({
  tier: "medium",
  allowHeavy: false,
  allowParallax: false,
  reducedMotion: false,
  ready: false,
})

export function usePerf() {
  return useContext(PerfContext)
}

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/**
 * Detects the device budget ONCE on mount and writes it to
 * `<html data-perf="...">` so CSS can switch off animations without any
 * per-frame JavaScript. Low-tier devices get zero canvas work, zero
 * backdrop blur and zero transform transitions.
 */
function detectTier(): { tier: PerfTier; reducedMotion: boolean } {
  const nav = navigator as NavigatorWithHints
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (reducedMotion) return { tier: "low", reducedMotion: true }

  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const saveData = nav.connection?.saveData === true
  const slowNetwork = ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "")
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.innerWidth < 768

  let score = 0
  if (cores >= 8) score += 2
  else if (cores >= 4) score += 1
  if (memory >= 8) score += 2
  else if (memory >= 4) score += 1
  if (!coarsePointer) score += 1
  if (!narrow) score += 1

  if (saveData || slowNetwork || cores <= 2 || memory <= 2) return { tier: "low", reducedMotion: false }
  if (score >= 5) return { tier: "high", reducedMotion: false }
  return { tier: "medium", reducedMotion: false }
}

export function PerfProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ tier: PerfTier; reducedMotion: boolean }>({
    tier: "medium",
    reducedMotion: false,
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const detected = detectTier()
    setState(detected)
    setReady(true)
    document.documentElement.dataset.perf = detected.tier

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => {
      const next = detectTier()
      setState(next)
      document.documentElement.dataset.perf = next.tier
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const value = useMemo<PerfState>(
    () => ({
      tier: state.tier,
      reducedMotion: state.reducedMotion,
      allowHeavy: ready && state.tier === "high",
      allowParallax: ready && state.tier !== "low",
      ready,
    }),
    [state, ready],
  )

  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>
}
