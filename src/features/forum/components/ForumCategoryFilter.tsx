import type { ForumCategory } from '@/shared/types'
import { FORUM_CATEGORIES } from '@/shared/constants'

export function ForumCategoryFilter({
  counts,
  total,
  value,
  onChange,
}: {
  counts: Record<ForumCategory, number>
  total: number
  value: ForumCategory | 'Todas'
  onChange: (category: ForumCategory | 'Todas') => void
}) {
  return (
    <div
      className="flex flex-wrap gap-2 mb-5"
      role="group"
      aria-label="Filtrar tópicos por categoria"
    >
      <button
        onClick={() => onChange('Todas')}
        aria-pressed={value === 'Todas'}
        className="px-3 py-1.5 text-xs transition-colors"
        style={{
          background: value === 'Todas' ? 'var(--primary)' : 'var(--card)',
          color: value === 'Todas' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        Todas ({total})
      </button>
      {FORUM_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          aria-pressed={value === category}
          className="px-3 py-1.5 text-xs transition-colors"
          style={{
            background: value === category ? 'var(--primary)' : 'var(--card)',
            color: value === category ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          {category} ({counts[category]})
        </button>
      ))}
    </div>
  )
}
