"use client"

import { cn } from "@/lib/utils"

/**
 * Pure-CSS 3D gyroscope. Six composited layers, no canvas, no WebGL, no JS —
 * so it costs a low-end phone nothing beyond a few GPU transforms, and the
 * `data-perf="low"` rules in globals.css freeze it entirely.
 */
export function HologramCore({ className }: { className?: string }) {
  const rings = [
    { size: 100, rx: 68, ry: 0, dur: "18s", dir: "normal" },
    { size: 82, rx: 20, ry: 62, dur: "24s", dir: "reverse" },
    { size: 64, rx: 78, ry: 34, dur: "14s", dir: "normal" },
  ]

  return (
    <div className={cn("scene-3d relative aspect-square w-full", className)} aria-hidden="true">
      <div className="absolute inset-0 animate-spin-slow [transform-style:preserve-3d]">
        {rings.map((ring, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-primary/35"
            style={{
              width: `${ring.size}%`,
              height: `${ring.size}%`,
              transform: `translate3d(-50%,-50%,0) rotateX(${ring.rx}deg) rotateY(${ring.ry}deg)`,
              animation: `spin-slow ${ring.dur} linear infinite ${ring.dir}`,
              boxShadow: "0 0 22px -8px var(--glow)",
            }}
          />
        ))}
      </div>

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2">
        <div className="clip-plate metal h-full w-full rotate-45 border border-primary/40 bg-card/80 animate-pulse-glow" />
      </div>

      {/* Radial floor glow — one element, no blur filter */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(closest-side,oklch(0.552_0.215_22/16%),transparent_72%)]" />
    </div>
  )
}
