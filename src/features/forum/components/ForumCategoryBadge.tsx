import type { ForumCategory } from '@/shared/types'

const CATEGORY_STYLES: Record<
  ForumCategory,
  { background: string; border: string; color: string }
> = {
  Comunicados: { background: '#eaf4ec', border: '#6aaa7a', color: '#1e4d2b' },
  Mutirões: { background: '#fdf5e6', border: '#d4a84b', color: '#7a5c00' },
  Dúvidas: { background: '#eef2f7', border: '#9db4c9', color: '#33506b' },
  'Plantio e manejo': { background: '#f3ece4', border: '#c9a37e', color: '#6b4423' },
}

export function ForumCategoryBadge({ category }: { category: ForumCategory }) {
  const style = CATEGORY_STYLES[category]
  return (
    <span
      className="text-xs px-2 py-0.5 shrink-0"
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {category}
    </span>
  )
}
