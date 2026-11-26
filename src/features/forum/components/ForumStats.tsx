import { FORUM_CATEGORIES } from '@/shared/constants'

export function ForumStats({
  topics,
  replies,
  categories,
}: {
  topics: number
  replies: number
  categories: number
}) {
  const stats = [
    {
      id: 'topics',
      label: 'Tópicos',
      value: topics,
      sub: 'discussões abertas',
    },
    {
      id: 'replies',
      label: 'Respostas',
      value: replies,
      sub: 'interações registradas',
    },
    {
      id: 'categories',
      label: 'Categorias ativas',
      value: categories,
      sub: `de ${FORUM_CATEGORIES.length} disponíveis`,
    },
  ]

  return (
    <div
      className="grid gap-4 mb-6"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
    >
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="px-5 py-4"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {stat.label}
          </p>
          <p
            data-testid={`forum-stat-${stat.id}`}
            className="text-2xl mb-0.5"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
          >
            {stat.value}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
