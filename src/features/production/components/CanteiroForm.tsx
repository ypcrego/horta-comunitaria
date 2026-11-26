import { useState } from 'react'
import type React from 'react'
import type { Canteiro, CanteiroStatus } from '@/shared/types'
import { CANTEIRO_STATUSES, CANTEIRO_STATUS_LABELS } from '@/shared/constants'
import type { NewCanteiroInput } from '../lib/canteiros'

type CanteiroFormFields = {
  name: string
  sector: string
  currentCulture: string
  status: CanteiroStatus
  responsible: string
  plantedAt: string
}

export function CanteiroForm({
  canteiro,
  sectors,
  defaultResponsible,
  onSubmit,
  onCancel,
}: {
  canteiro: Canteiro | null
  sectors: string[]
  defaultResponsible: string
  onSubmit: (input: NewCanteiroInput) => string | null
  onCancel: () => void
}) {
  const [form, setForm] = useState<CanteiroFormFields>({
    name: canteiro?.name ?? '',
    sector: canteiro?.sector ?? sectors[0] ?? '',
    currentCulture: canteiro?.currentCulture ?? '',
    status: canteiro?.status ?? 'em-preparo',
    responsible: canteiro?.responsible ?? defaultResponsible,
    plantedAt: canteiro?.plantedAt ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  function updateField<Key extends keyof CanteiroFormFields>(
    field: Key,
    value: CanteiroFormFields[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const message = onSubmit({
      name: form.name,
      sector: form.sector,
      currentCulture: form.currentCulture,
      status: form.status,
      responsible: form.responsible,
      plantedAt: form.plantedAt || null,
    })
    if (message) setError(message)
  }

  return (
    <div
      aria-label={canteiro ? 'Editar canteiro' : 'Novo canteiro'}
      className="mb-6 p-5"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <h3 className="text-base mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
        {canteiro ? `Editar ${canteiro.name}` : 'Novo canteiro'}
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Informe a identificação do canteiro, o setor ecológico e a cultura atual.
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
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-44">
            <label
              htmlFor="canteiro-name"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Nome
            </label>
            <input
              id="canteiro-name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              autoFocus
              placeholder="ex: Canteiro 7"
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="flex-1 min-w-44">
            <label
              htmlFor="canteiro-sector"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Setor
            </label>
            <input
              id="canteiro-sector"
              list="canteiro-sector-options"
              value={form.sector}
              onChange={(e) => updateField('sector', e.target.value)}
              required
              placeholder="ex: Setor D — Frutíferas"
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            />
            <datalist id="canteiro-sector-options">
              {sectors.map((sector) => (
                <option key={sector} value={sector} />
              ))}
            </datalist>
          </div>
          <div className="flex-1 min-w-40">
            <label
              htmlFor="canteiro-culture"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Cultura atual
            </label>
            <input
              id="canteiro-culture"
              value={form.currentCulture}
              onChange={(e) => updateField('currentCulture', e.target.value)}
              placeholder="ex: Manjericão"
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

        <div className="flex flex-wrap gap-4 items-end mt-4">
          <div className="w-44">
            <label
              htmlFor="canteiro-status"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Status
            </label>
            <select
              id="canteiro-status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as CanteiroStatus)}
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            >
              {CANTEIRO_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CANTEIRO_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-44">
            <label
              htmlFor="canteiro-responsible"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Responsável
            </label>
            <input
              id="canteiro-responsible"
              value={form.responsible}
              onChange={(e) => updateField('responsible', e.target.value)}
              required
              placeholder="ex: Ana Beatriz Costa"
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="w-44">
            <label
              htmlFor="canteiro-planted-at"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Data de plantio
            </label>
            <input
              id="canteiro-planted-at"
              type="date"
              value={form.plantedAt}
              onChange={(e) => updateField('plantedAt', e.target.value)}
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

        <div className="flex justify-end gap-2 mt-4">
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
            {canteiro ? 'Salvar alterações' : 'Criar canteiro'}
          </button>
        </div>
      </form>
    </div>
  )
}
