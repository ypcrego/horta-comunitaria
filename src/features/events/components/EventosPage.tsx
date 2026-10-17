import { useState } from 'react'
import type React from 'react'
import type { User, Event } from '@/shared/types'
import { today, formatDate } from '@/shared/utils'

export function EventosPage({
  user,
  events,
  onAdd,
}: {
  user: User
  events: Event[]
  onAdd: (e: Omit<Event, 'id'>) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [capacity, setCapacity] = useState('')
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const isCoord = user.role === 'coordenador'

  const upcoming = events.filter((e) => e.date >= today())
  const past = events.filter((e) => e.date < today())
  const displayed = tab === 'upcoming' ? upcoming : past

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAdd({
      title,
      date,
      time,
      capacity: parseInt(capacity),
      description,
      createdBy: user.name,
    })
    setTitle('')
    setDate('')
    setTime('')
    setCapacity('')
    setDescription('')
    setShowForm(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Eventos
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Visitas guiadas, oficinas e ações externas.
          </p>
        </div>
        {isCoord && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Novo evento
          </button>
        )}
      </div>

      {!isCoord && (
        <div
          className="mb-6 px-4 py-3 text-sm"
          style={{
            background: '#fdf5e6',
            border: '1px solid #d4a84b',
            borderRadius: 'var(--radius)',
            color: '#7a5c00',
          }}
        >
          Você está visualizando os eventos como voluntário. O agendamento de novos eventos é restrito ao coordenador.
        </div>
      )}

      {success && (
        <div
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: '#eaf4ec',
            border: '1px solid #6aaa7a',
            borderRadius: 'var(--radius)',
            color: '#1e4d2b',
          }}
        >
          Evento criado com sucesso e adicionado à lista de próximos eventos.
        </div>
      )}

      {/* Form */}
      {showForm && isCoord && (
        <div
          className="mb-6 p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        >
          <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Novo Evento
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Título
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="ex: Visita guiada — Turma de Biologia"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-36">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  min={today()}
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div className="flex-1 min-w-28">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div className="flex-1 min-w-28">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  Vagas
                </label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  placeholder="ex: 30"
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descreva brevemente o evento…"
                className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Agendar evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-5 p-1"
        style={{
          background: 'var(--muted)',
          borderRadius: 'var(--radius)',
          display: 'inline-flex',
        }}
      >
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 text-sm transition-all"
            style={{
              background: tab === t ? 'var(--card)' : 'transparent',
              color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderRadius: 'var(--radius)',
              fontWeight: tab === t ? 500 : 400,
              border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {t === 'upcoming' ? `Próximos (${upcoming.length})` : `Histórico (${past.length})`}
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {displayed.length === 0 && (
          <div
            className="text-center py-12 text-sm"
            style={{ color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
          >
            {tab === 'upcoming' ? 'Nenhum evento futuro agendado.' : 'Nenhum evento passado no histórico.'}
          </div>
        )}
        {displayed.map((ev) => (
          <div
            key={ev.id}
            className="flex gap-4 p-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <div
              className="shrink-0 text-center px-3 py-1.5"
              style={{
                background: tab === 'upcoming' ? 'var(--primary)' : 'var(--muted)',
                color: tab === 'upcoming' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius)',
                minWidth: 56,
              }}
            >
              <p className="text-xs uppercase tracking-wide opacity-80">
                {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
              </p>
              <p className="text-2xl font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {ev.date.split('-')[2]}
              </p>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm">{ev.title}</p>
                {!isCoord && (
                  <span
                    className="text-xs px-2 py-0.5 shrink-0"
                    style={{
                      background: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                      borderRadius: 12,
                    }}
                  >
                    somente leitura
                  </span>
                )}
              </div>
              {ev.description && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {ev.description}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>{formatDate(ev.date)}</span>
                <span>{ev.time}</span>
                <span>{ev.capacity} vagas</span>
                <span>por {ev.createdBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
