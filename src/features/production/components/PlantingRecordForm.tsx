import { useState } from 'react'
import type React from 'react'
import type { Canteiro, PlantingRecordType } from '@/shared/types'
import { PLANTING_RECORD_TYPES, PLANTING_RECORD_TYPE_LABELS } from '@/shared/constants'
import { today } from '@/shared/utils'
import type { NewPlantingRecordInput } from '../lib/canteiros'

export function PlantingRecordForm({
  canteiros,
  defaultResponsible,
  onSubmit,
  onCancel,
}: {
  canteiros: Canteiro[]
  defaultResponsible: string
  onSubmit: (input: NewPlantingRecordInput) => string | null
  onCancel: () => void
}) {
  const [selectedCanteiroId, setSelectedCanteiroId] = useState<number>(canteiros[0]?.id ?? 0)
  const [recordType, setRecordType] = useState<PlantingRecordType>('plantio')
  const [recordCulture, setRecordCulture] = useState(canteiros[0]?.currentCulture ?? '')
  const [recordDate, setRecordDate] = useState(today())
  const [recordQuantity, setRecordQuantity] = useState('')
  const [recordNotes, setRecordNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCanteiroChange(value: string) {
    const canteiroId = Number.parseInt(value, 10)
    setSelectedCanteiroId(canteiroId)
    const canteiro = canteiros.find((candidate) => candidate.id === canteiroId)
    setRecordCulture(canteiro?.currentCulture ?? '')
  }

  function handleRecordTypeChange(value: string) {
    const nextType = value as PlantingRecordType
    setRecordType(nextType)
    if (nextType !== 'colheita') setRecordQuantity('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const quantity =
      recordType === 'colheita' && recordQuantity.trim() !== ''
        ? Number.parseFloat(recordQuantity)
        : null

    const message = onSubmit({
      canteiroId: selectedCanteiroId,
      type: recordType,
      culture: recordCulture,
      quantityKg: quantity,
      notes: recordNotes,
      date: recordDate,
    })
    if (message) setError(message)
  }

  return (
    <div
      aria-label="Registro de plantio e manejo"
      className="mb-6 p-5"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <h3 className="text-base mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
        Novo registro no histórico dos canteiros
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Registre plantio, manejo ou colheita. O histórico fica salvo neste navegador.
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
          <div className="flex-1 min-w-48">
            <label
              htmlFor="planting-canteiro"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Canteiro
            </label>
            <select
              id="planting-canteiro"
              value={selectedCanteiroId}
              onChange={(e) => handleCanteiroChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            >
              {canteiros.map((canteiro) => (
                <option key={canteiro.id} value={canteiro.id}>
                  {canteiro.name} — {canteiro.sector}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label
              htmlFor="planting-type"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Tipo de registro
            </label>
            <select
              id="planting-type"
              value={recordType}
              onChange={(e) => handleRecordTypeChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                background: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            >
              {PLANTING_RECORD_TYPES.map((record) => (
                <option key={record} value={record}>
                  {PLANTING_RECORD_TYPE_LABELS[record]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-44">
            <label
              htmlFor="planting-culture"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Cultura
            </label>
            <input
              id="planting-culture"
              value={recordCulture}
              onChange={(e) => setRecordCulture(e.target.value)}
              required={recordType === 'plantio'}
              placeholder="ex: Alface crespa"
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
              htmlFor="planting-date"
              className="block text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Data do registro
            </label>
            <input
              id="planting-date"
              type="date"
              value={recordDate}
              max={today()}
              onChange={(e) => setRecordDate(e.target.value)}
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
          {recordType === 'colheita' && (
            <div className="w-44">
              <label
                htmlFor="planting-quantity"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Quantidade colhida (kg)
              </label>
              <input
                id="planting-quantity"
                type="number"
                step="0.1"
                min="0.1"
                value={recordQuantity}
                onChange={(e) => setRecordQuantity(e.target.value)}
                placeholder="ex: 2.5"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="planting-notes"
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Observações
          </label>
          <textarea
            id="planting-notes"
            rows={2}
            value={recordNotes}
            onChange={(e) => setRecordNotes(e.target.value)}
            placeholder="ex: Mudas transplantadas com adubo orgânico."
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
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Responsável: <strong style={{ color: 'var(--foreground)' }}>{defaultResponsible}</strong>
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
              Registrar no histórico
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
