import { useEffect, useState } from 'react'
import type { ForumCategory, User } from '@/shared/types'
import { FORUM_CATEGORIES } from '@/shared/constants'
import { useForum } from '../hooks/useForum'
import {
  filterTopics,
  getForumStats,
  sortTopicsByActivity,
  type NewTopicInput,
} from '../lib/forum'
import { ForumCategoryFilter } from './ForumCategoryFilter'
import { ForumStats } from './ForumStats'
import { ForumTopicCard } from './ForumTopicCard'
import { ForumTopicDetail } from './ForumTopicDetail'
import { ForumTopicForm } from './ForumTopicForm'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

export function ForumPage({ user }: { user: User }) {
  const { topics, createTopic, replyToTopic } = useForum()
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<ForumCategory | 'Todas'>('Todas')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [returnFocusTopicId, setReturnFocusTopicId] = useState<number | null>(null)

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? null
  const stats = getForumStats({ topics })
  const filteredTopics = sortTopicsByActivity(filterTopics(topics, categoryFilter))
  const categoryCounts = FORUM_CATEGORIES.reduce<Record<ForumCategory, number>>(
    (counts, forumCategory) => {
      counts[forumCategory] = topics.filter((topic) => topic.category === forumCategory).length
      return counts
    },
    {} as Record<ForumCategory, number>,
  )

  useEffect(() => {
    if (returnFocusTopicId === null || selectedTopic) return

    const titleButton = document.getElementById(`forum-topic-title-${returnFocusTopicId}`)
    titleButton?.focus()
    setReturnFocusTopicId(null)
  }, [returnFocusTopicId, selectedTopic])

  function openTopicForm() {
    setFeedback(null)
    setShowForm((current) => !current)
  }

  function closeTopicForm() {
    setShowForm(false)
    setFeedback(null)
  }

  function handleCreateTopic(input: NewTopicInput): string | null {
    const error = createTopic(input, user.name)
    if (error) return error

    setFeedback({
      type: 'success',
      message: `Tópico "${input.title.trim()}" publicado no fórum.`,
    })
    setCategoryFilter('Todas')
    setShowForm(false)
    return null
  }

  function openTopic(topicId: number) {
    setReturnFocusTopicId(null)
    setSelectedTopicId(topicId)
    setShowForm(false)
    setFeedback(null)
  }

  function closeTopic() {
    setReturnFocusTopicId(selectedTopicId)
    setSelectedTopicId(null)
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
          onBack={closeTopic}
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
            <ForumTopicForm
              userName={user.name}
              onSubmit={handleCreateTopic}
              onCancel={closeTopicForm}
            />
          )}

          <ForumStats
            topics={stats.topics}
            replies={stats.replies}
            categories={stats.categories}
          />

          <ForumCategoryFilter
            counts={categoryCounts}
            total={topics.length}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />

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
                <ForumTopicCard key={topic.id} topic={topic} onOpen={openTopic} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
