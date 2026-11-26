import { useState } from 'react'
import type React from 'react'
import type { ForumCategory, User } from '@/shared/types'
import { FORUM_CATEGORIES } from '@/shared/constants'
import { formatDateTime } from '@/shared/utils'
import { useForum } from '../hooks/useForum'
import {
  filterTopics,
  getForumStats,
  getTopicLastActivity,
  sortTopicsByActivity,
} from '../lib/forum'
import { ForumCategoryBadge } from './ForumCategoryBadge'
import { ForumTopicDetail } from './ForumTopicDetail'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

export function ForumPage({ user }: { user: User }) {
  const { topics, createTopic, replyToTopic } = useForum()
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ForumCategory>(FORUM_CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ForumCategory | 'Todas'>('Todas')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null
  const stats = getForumStats({ topics })
  const filteredTopics = sortTopicsByActivity(filterTopics(topics, categoryFilter))
  const categoryCounts = FORUM_CATEGORIES.map((forumCategory) => ({
    category: forumCategory,
    count: topics.filter((topic) => topic.category === forumCategory).length,
  }))

  function openTopicForm() {
    setFeedback(null)
    setShowForm((current) => !current)
  }

  function closeTopicForm() {
    setShowForm(false)
    setFeedback(null)
  }

  function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault()
    const error = createTopic({ title, category, message }, user.name)
    if (error) {
      setFeedback({ type: 'error', message: error })
      return
    }

    setFeedback({
      type: 'success',
      message: `Tópico "${title.trim()}" publicado no fórum.`,
    })
    setTitle('')
    setCategory(FORUM_CATEGORIES[0])
    setMessage('')
    setCategoryFilter('Todas')
    setShowForm(false)
  }

  function openTopic(topicId: number) {
    setSelectedTopicId(topicId)
    setShowForm(false)
    setFeedback(null)
  }

  function handleReply(replyMessage: string): string | null {
    if (!selectedTopic) return 'Tópico não encontrado.'
    return replyToTopic(selectedTopic.id, replyMessage, user.name)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Fórum
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Comunicados, mutirões e dúvidas da horta em um só lugar.
          </p>
        </div>
        {!selectedTopic && (
          <button
            onClick={openTopicForm}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Novo tópico
          </button>
        )}
      </div>

      {selectedTopic ? (
        <ForumTopicDetail
          topic={selectedTopic}
          user={user}
          onBack={() => setSelectedTopicId(null)}
          onReply={handleReply}
        />
      ) : (
        <>
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

          {showForm && (
            <div
              aria-label="Novo tópico"
              className="mb-6 p-5"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <h3 className="text-base mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                Novo tópico
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Abra uma discussão para centralizar comunicados, mutirões e dúvidas da equipe.
              </p>

              <form onSubmit={handleCreateTopic}>
                <div>
                  <label
                    htmlFor="forum-title"
                    className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Título
                  </label>
                  <input
                    id="forum-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                    placeholder="ex: Mutirão de plantio no sábado"
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="forum-category"
                    className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Categoria
                  </label>
                  <select
                    id="forum-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ForumCategory)}
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {FORUM_CATEGORIES.map((forumCategory) => (
                      <option key={forumCategory} value={forumCategory}>
                        {forumCategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="forum-message"
                    className="block text-xs uppercase tracking-widest mb-1.5"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="forum-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Descreva o assunto e as informações importantes para a equipe…"
                    className="w-full px-3 py-2.5 text-sm outline-none resize-y"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Publicando como{' '}
                    <strong style={{ color: 'var(--foreground)' }}>{user.name}</strong>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeTopicForm}
                      className="px-4 py-2.5 text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 text-sm font-medium"
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      Publicar tópico
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div
            className="grid gap-4 mb-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
          >
            <div
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
                Tópicos
              </p>
              <p
                data-testid="forum-stat-topics"
                className="text-2xl mb-0.5"
                style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
              >
                {stats.topics}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                discussões abertas
              </p>
            </div>
            <div
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
                Respostas
              </p>
              <p
                data-testid="forum-stat-replies"
                className="text-2xl mb-0.5"
                style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
              >
                {stats.replies}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                interações registradas
              </p>
            </div>
            <div
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
                Categorias ativas
              </p>
              <p
                data-testid="forum-stat-categories"
                className="text-2xl mb-0.5"
                style={{ fontFamily: 'Fraunces, serif', color: 'var(--primary)' }}
              >
                {stats.categories}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                de {FORUM_CATEGORIES.length} disponíveis
              </p>
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2 mb-5"
            role="group"
            aria-label="Filtrar tópicos por categoria"
          >
            <button
              onClick={() => setCategoryFilter('Todas')}
              aria-pressed={categoryFilter === 'Todas'}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                background: categoryFilter === 'Todas' ? 'var(--primary)' : 'var(--card)',
                color: categoryFilter === 'Todas' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                borderRadius: 12,
              }}
            >
              Todas ({topics.length})
            </button>
            {categoryCounts.map(({ category: forumCategory, count }) => (
              <button
                key={forumCategory}
                onClick={() => setCategoryFilter(forumCategory)}
                aria-pressed={categoryFilter === forumCategory}
                className="px-3 py-1.5 text-xs transition-colors"
                style={{
                  background:
                    categoryFilter === forumCategory ? 'var(--primary)' : 'var(--card)',
                  color:
                    categoryFilter === forumCategory
                      ? 'var(--primary-foreground)'
                      : 'var(--muted-foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                {forumCategory} ({count})
              </button>
            ))}
          </div>

          {filteredTopics.length === 0 ? (
            <div
              className="text-center py-12 text-sm"
              style={{
                color: 'var(--muted-foreground)',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              {topics.length === 0
                ? 'Nenhum tópico publicado ainda.'
                : 'Nenhum tópico nesta categoria.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <article
                  key={topic.id}
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
                      {topic.replies.length}{' '}
                      {topic.replies.length === 1 ? 'resposta' : 'respostas'}
                    </span>
                  </div>

                  <button
                    onClick={() => openTopic(topic.id)}
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
                    onClick={() => openTopic(topic.id)}
                    aria-label={`Abrir tópico ${topic.title}`}
                    className="mt-3 text-xs font-medium"
                    style={{ color: 'var(--primary)' }}
                  >
                    Abrir tópico →
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
