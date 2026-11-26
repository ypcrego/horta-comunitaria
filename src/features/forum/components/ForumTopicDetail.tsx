import { useState } from 'react'
import type React from 'react'
import type { ForumTopic, User } from '@/shared/types'
import { formatDateTime } from '@/shared/utils'
import { ForumCategoryBadge } from './ForumCategoryBadge'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

export function ForumTopicDetail({
  topic,
  user,
  onBack,
  onReply,
}: {
  topic: ForumTopic
  user: User
  onBack: () => void
  onReply: (message: string) => string | null
}) {
  const [reply, setReply] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const replies = [...topic.replies].sort((first, second) =>
    first.createdAt.localeCompare(second.createdAt),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = onReply(reply)
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }

    setReply('')
    setFeedback({ type: 'success', message: 'Resposta publicada no tópico.' })
  }

  return (
    <section aria-label={`Tópico ${topic.title}`}>
      <button
        onClick={onBack}
        className="text-sm mb-4 transition-opacity hover:opacity-80"
        style={{ color: 'var(--primary)' }}
      >
        ← Voltar ao fórum
      </button>

      <article
        className="p-5 mb-6"
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
        <h3 className="text-xl mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
          {topic.title}
        </h3>
        <p className="text-sm whitespace-pre-line mb-4">{topic.message}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Criado por <strong style={{ color: 'var(--foreground)' }}>{topic.author}</strong> em{' '}
          {formatDateTime(topic.createdAt)}
        </p>
      </article>

      <div
        className="p-5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h4 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
          Linha do tempo de respostas
        </h4>

        {replies.length === 0 ? (
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Nenhuma resposta ainda. Seja a primeira pessoa a comentar.
          </p>
        ) : (
          <ol className="space-y-4 mb-5">
            {replies.map((replyItem) => (
              <li
                key={replyItem.id}
                className="pl-4"
                style={{ borderLeft: '2px solid var(--border)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <strong className="text-sm">{replyItem.author}</strong>
                  <time
                    dateTime={replyItem.createdAt}
                    className="text-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {formatDateTime(replyItem.createdAt)}
                  </time>
                </div>
                <p className="text-sm whitespace-pre-line">{replyItem.message}</p>
              </li>
            ))}
          </ol>
        )}

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className="mb-4 px-4 py-3 text-sm"
            style={{
              background: feedback.type === 'error' ? '#fdf0ec' : '#eaf4ec',
              border: `1px solid ${feedback.type === 'error' ? '#e2a090' : '#6aaa7a'}`,
              borderRadius: 'var(--radius)',
              color: feedback.type === 'error' ? '#8a3b12' : '#1e4d2b',
            }}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="forum-reply"
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Resposta
          </label>
          <textarea
            id="forum-reply"
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            required
            placeholder="Escreva sua resposta para a equipe…"
            className="w-full px-3 py-2.5 text-sm outline-none resize-y"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Respondendo como <strong style={{ color: 'var(--foreground)' }}>{user.name}</strong>
            </p>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
              }}
            >
              Enviar resposta
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
