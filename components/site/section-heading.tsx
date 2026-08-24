import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <Reveal className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-primary" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  )
}
