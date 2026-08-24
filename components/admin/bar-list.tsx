export interface BarItem {
  label: string
  value: number
}

// Lightweight, dependency-free bar chart. Keeps the admin dashboard fast on
// budget mobile devices — no charting library or WebGL required.
export function BarList({
  items,
  emptyLabel = 'No data yet.',
}: {
  items: BarItem[]
  emptyLabel?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))

  if (items.length === 0) {
    return (
      <p className="py-6 text-center font-mono text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="truncate pr-3 text-foreground">{item.label}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {item.value}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
