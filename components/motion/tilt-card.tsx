"use client"

import { useCallback, useRef } from "react"
import { usePerf } from "@/components/perf/perf-provider"
import { cn } from "@/lib/utils"

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max rotation in degrees. Keep small — subtle reads as expensive. */
  max?: number
  glare?: boolean
}

/**
 * 3D pointer tilt. Writes CSS custom properties inside a single rAF, so a
 * fast-moving pointer can never queue more than one style write per frame.
 * Completely inert on low-tier devices and touch input.
 */
export function TiltCard({ max = 7, glare = true, className, children, ...rest }: TiltCardProps) {
  const { allowParallax } = usePerf()
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const next = useRef({ rx: 0, ry: 0, mx: 50, my: 50 })

  const flush = useCallback(() => {
    frame.current = 0
    const el = ref.current
    if (!el) return
    const { rx, ry, mx, my } = next.current
    el.style.setProperty("--rx", `${rx}deg`)
    el.style.setProperty("--ry", `${ry}deg`)
    el.style.setProperty("--mx", `${mx}%`)
    el.style.setProperty("--my", `${my}%`)
  }, [])

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!allowParallax || e.pointerType !== "mouse") return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      next.current = {
        rx: (0.5 - py) * max * 2,
        ry: (px - 0.5) * max * 2,
        mx: px * 100,
        my: py * 100,
      }
      if (!frame.current) frame.current = requestAnimationFrame(flush)
    },
    [allowParallax, flush, max],
  )

  const onLeave = useCallback(() => {
    next.current = { rx: 0, ry: 0, mx: 50, my: 50 }
    if (!frame.current) frame.current = requestAnimationFrame(flush)
  }, [flush])

  return (
    <div className="scene-3d">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn("tilt-3d relative", className)}
        {...rest}
      >
        {children}
        {glare && allowParallax && (
          <span
            aria-hidden="true"
            data-heavy
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(220px_circle_at_var(--mx,50%)_var(--my,50%),oklch(1_0_0/10%),transparent_60%)] group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  )
}
