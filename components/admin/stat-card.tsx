import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <span
          className={
            accent
              ? 'flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary'
              : 'flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground'
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
        {value}
      </p>
    </div>
  )
}
