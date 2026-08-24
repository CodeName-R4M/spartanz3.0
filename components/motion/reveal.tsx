"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Scroll reveal using a SINGLE shared IntersectionObserver.
 * No scroll listeners, no per-frame JS, animation runs on the compositor.
 */
let sharedObserver: IntersectionObserver | null = null
const callbacks = new WeakMap<Element, () => void>()

function observe(el: Element, cb: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    cb()
    return () => {}
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callbacks.get(entry.target)?.()
            sharedObserver?.unobserve(entry.target)
            callbacks.delete(entry.target)
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    )
  }
  callbacks.set(el, cb)
  sharedObserver.observe(el)
  return () => {
    sharedObserver?.unobserve(el)
    callbacks.delete(el)
  }
}

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  variant?: "up" | "scale"
  as?: "div" | "section" | "li" | "article" | "header"
}

export function Reveal({ delay = 0, variant = "up", as = "div", className, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observe(el, () => setVisible(true))
  }, [])

  const Tag = as as "div"

  return (
    <Tag
      ref={ref}
      data-reveal={variant === "scale" ? "scale" : ""}
      data-visible={visible ? "true" : "false"}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
