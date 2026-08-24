"use client"

import { useEffect, useRef } from "react"
import { usePerf } from "@/components/perf/perf-provider"
import { cn } from "@/lib/utils"

interface ParticleFieldProps {
  className?: string
  /** Particle count on a high-tier desktop. Scaled down by area. */
  density?: number
}

/**
 * Depth-sorted 3D ember field on a 2D canvas.
 *
 * Performance contract:
 *  - renders ONLY on high-tier devices (never on phones / low-power / reduced motion)
 *  - DPR capped at 1.5, particle count scaled by viewport area
 *  - rAF loop stops when the canvas scrolls out of view or the tab is hidden
 *  - no allocations inside the loop, no shadows, no gradients per particle
 */
export function ParticleField({ className, density = 70 }: ParticleFieldProps) {
  const { allowHeavy } = usePerf()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!allowHeavy) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = 0
    let height = 0
    let raf = 0
    let running = false

    const count = Math.max(
      18,
      Math.min(density, Math.round((window.innerWidth * window.innerHeight) / 26000)),
    )

    const xs = new Float32Array(count)
    const ys = new Float32Array(count)
    const zs = new Float32Array(count)
    const vy = new Float32Array(count)
    const vx = new Float32Array(count)

    function seed(i: number, spread = 1) {
      xs[i] = Math.random()
      ys[i] = spread === 1 ? Math.random() : 1 + Math.random() * 0.2
      zs[i] = 0.25 + Math.random() * 0.75
      vy[i] = 0.00018 + Math.random() * 0.0004
      vx[i] = (Math.random() - 0.5) * 0.00016
    }
    for (let i = 0; i < count; i++) seed(i)

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let last = 0
    function frame(now: number) {
      if (!running) return
      const dt = Math.min(now - last, 48)
      last = now
      ctx!.clearRect(0, 0, width, height)

      for (let i = 0; i < count; i++) {
        ys[i] -= vy[i] * dt
        xs[i] += vx[i] * dt
        if (ys[i] < -0.05) seed(i, 0)

        const z = zs[i]
        const size = 0.6 + z * 1.9
        ctx!.globalAlpha = 0.12 + z * 0.5
        ctx!.fillStyle = i % 5 === 0 ? "oklch(0.78 0.02 40)" : "oklch(0.62 0.21 24)"
        ctx!.beginPath()
        ctx!.arc(xs[i] * width, ys[i] * height, size, 0, 6.283185)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    function start() {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    )
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)

    let resizeTimer: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 200)
    }
    window.addEventListener("resize", onResize)

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("resize", onResize)
      window.clearTimeout(resizeTimer)
    }
  }, [allowHeavy, density])

  if (!allowHeavy) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-heavy
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  )
}
