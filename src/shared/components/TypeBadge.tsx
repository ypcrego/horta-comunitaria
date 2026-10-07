import { TYPE_COLORS } from '../constants'

export function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? 'var(--muted-foreground)'
  return (
    <span
      className="text-xs px-2 py-0.5 font-medium"
      style={{
        background: color + '18',
        color,
        borderRadius: 12,
        border: `1px solid ${color}30`,
      }}
    >
      {type}
    </span>
  )
}
