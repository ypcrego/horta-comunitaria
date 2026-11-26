import type { ForumTopic } from '@/shared/types'
import { formatDateTime } from '@/shared/utils'
import { getTopicLastActivity } from '../lib/forum'
import { ForumCategoryBadge } from './ForumCategoryBadge'

export function ForumTopicCard({
  topic,
  onOpen,
}: {
  topic: ForumTopic
  onOpen: (topicId: number) => void
}) {
  return (
    <article
      aria-label={`Tópico: ${topic.title}`}
      className="p-5"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <ForumCategoryBadge category={topic.category} />
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {topic.replies.length} {topic.replies.length === 1 ? 'resposta' : 'respostas'}
        </span>
      </div>

      <button
        id={`forum-topic-title-${topic.id}`}
        onClick={() => onOpen(topic.id)}
        className="text-left text-base font-medium"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        {topic.title}
      </button>

      <p
        className="text-sm mt-2 line-clamp-2 whitespace-pre-line"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {topic.message}
      </p>

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <span>por {topic.author}</span>
        <span>{formatDateTime(topic.createdAt)}</span>
        <span>Última atividade: {formatDateTime(getTopicLastActivity(topic))}</span>
      </div>

      <button
        onClick={() => onOpen(topic.id)}
        aria-label={`Abrir tópico ${topic.title}`}
        className="mt-3 text-xs font-medium"
        style={{ color: 'var(--primary)' }}
      >
        Abrir tópico →
      </button>
    </article>
  )
}
