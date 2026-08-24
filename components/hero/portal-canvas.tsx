'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazily load the heavy WebGL scene only on the client, after first paint.
const PortalScene = dynamic(() => import('./portal-scene'), {
  ssr: false,
  loading: () => null,
})

function CssPortalFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative h-[70vmin] w-[70vmin] max-w-[520px] max-h-[520px]">
        <div className="absolute inset-0 rounded-full border-2 border-primary/70 box-glow-red animate-flicker" />
        <div className="absolute inset-[12%] rounded-full border border-accent/60" />
        <div className="absolute inset-[26%] rounded-full border border-primary/50" />
        <div className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle,theme(colors.primary/40%),transparent_70%)] blur-md" />
        <div className="absolute inset-0 rounded-full animate-pulse-ring border border-primary/40" />
      </div>
    </div>
  )
}

export default function PortalCanvas() {
  const [enable3D, setEnable3D] = useState(false)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Skip WebGL on small/low-power screens and when reduced motion is requested.
    const smallScreen = window.matchMedia('(max-width: 640px)').matches
    const lowMem =
      // @ts-expect-error non-standard but useful
      typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory < 4
    if (reduce || smallScreen || lowMem) return

    // Defer mount until the browser is idle so hero text paints instantly.
    const idle =
      (window as typeof window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
    const id = idle(() => setEnable3D(true))
    return () => {
      if (typeof id === 'number') clearTimeout(id)
    }
  }, [])

  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      {enable3D ? <PortalScene /> : <CssPortalFallback />}
      {/* Cinematic gradient wash so text stays readable over the portal */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_78%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
    </div>
  )
}
