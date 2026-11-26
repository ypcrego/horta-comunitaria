import { useState } from 'react'
import type React from 'react'
import type { ForumCategory } from '@/shared/types'
import { FORUM_CATEGORIES } from '@/shared/constants'
import type { NewTopicInput } from '../lib/forum'

export function ForumTopicForm({
  userName,
  onSubmit,
  onCancel,
}: {
  userName: string
  onSubmit: (input: NewTopicInput) => string | null
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ForumCategory>(FORUM_CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errorMessage = onSubmit({ title, category, message })
    if (errorMessage) setError(errorMessage)
  }

  return (
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

      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: '#fdf0ec',
            border: '1px solid #e2a090',
            borderRadius: 'var(--radius)',
            color: '#8a3b12',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            <strong style={{ color: 'var(--foreground)' }}>{userName}</strong>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
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
  )
}
