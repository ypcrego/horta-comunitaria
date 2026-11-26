import { useState } from 'react'
import type React from 'react'
import type { Canteiro, PlantingRecordType, Production, User } from '@/shared/types'
import { PRODUCTION_TYPES, TYPE_COLORS } from '@/shared/constants'
import { today, formatDate } from '@/shared/utils'
import { TypeBadge } from '@/shared/components'
import { useCanteiros } from '../hooks/useCanteiros'
import {
  getCanteiroSectors,
  type NewCanteiroInput,
  type NewPlantingRecordInput,
} from '../lib/canteiros'
import { CanteiroForm } from './CanteiroForm'
import { CanteiroMap } from './CanteiroMap'
import { PlantingHistory } from './PlantingHistory'
import { PlantingRecordForm } from './PlantingRecordForm'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

const RECORD_FEEDBACK_LABELS: Record<PlantingRecordType, string> = {
  plantio: 'Plantio registrado',
  manejo: 'Manejo registrado',
  colheita: 'Colheita registrada',
}

export function ProducaoPage({
  user,
  productions,
  onAdd,
}: {
  user: User
  productions: Production[]
  onAdd: (p: Omit<Production, 'id'>) => void
}) {
  const {
    canteiros,
    records,
    registerRecord,
    addCanteiro,
    updateCanteiro,
  } = useCanteiros()
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState(PRODUCTION_TYPES[0])
  const [weight, setWeight] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterType, setFilterType] = useState('Todos')

  const [showCanteiroForm, setShowCanteiroForm] = useState(false)
  const [editingCanteiro, setEditingCanteiro] = useState<Canteiro | null>(null)
  const [canteiroFeedback, setCanteiroFeedback] = useState<Feedback | null>(null)

  const [showPlantingForm, setShowPlantingForm] = useState(false)
  const [plantingFeedback, setPlantingFeedback] = useState<Feedback | null>(null)

  const isCoord = user.role === 'coordenador'

  const totalKg = productions.reduce((s, p) => s + p.weightKg, 0)
  const byType: Record<string, number> = {}
  for (const p of productions) {
    byType[p.type] = (byType[p.type] ?? 0) + p.weightKg
  }

  const filtered = filterType === 'Todos' ? productions : productions.filter((p) => p.type === filterType)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseFloat(weight)
    if (isNaN(kg) || kg <= 0) return
    onAdd({ type, weightKg: kg, date: today(), registeredBy: user.name })
    setWeight('')
    setShowForm(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  function openPlantingForm() {
    if (showPlantingForm) {
      setShowPlantingForm(false)
      return
    }

    setPlantingFeedback(null)
    setCanteiroFeedback(null)
    setShowPlantingForm(true)
  }

  function handlePlantingSubmit(input: NewPlantingRecordInput): string | null {
    const error = registerRecord(input, user.name)
    if (error) return error

    const canteiro = canteiros.find((candidate) => candidate.id === input.canteiroId)
    setPlantingFeedback({
      type: 'success',
      message: `${RECORD_FEEDBACK_LABELS[input.type]} no histórico do ${
        canteiro?.name ?? 'canteiro'
      }.`,
    })
    setShowPlantingForm(false)
    setCanteiroFeedback(null)
    return null
  }

  function openNewCanteiroForm() {
    setEditingCanteiro(null)
    setCanteiroFeedback(null)
    setPlantingFeedback(null)
    setShowCanteiroForm(true)
  }

  function openEditCanteiroForm(canteiro: Canteiro) {
    setEditingCanteiro(canteiro)
    setCanteiroFeedback(null)
    setPlantingFeedback(null)
    setShowCanteiroForm(true)
  }

  function closeCanteiroForm() {
    setShowCanteiroForm(false)
    setEditingCanteiro(null)
  }

  function handleCanteiroSubmit(input: NewCanteiroInput): string | null {
    const error = editingCanteiro
      ? updateCanteiro(editingCanteiro.id, input)
      : addCanteiro(input)
    if (error) return error

    setCanteiroFeedback({
      type: 'success',
      message: editingCanteiro
        ? `Canteiro "${input.name}" atualizado com sucesso.`
        : `Canteiro "${input.name}" criado com sucesso.`,
    })
    setPlantingFeedback(null)
    closeCanteiroForm()
    return null
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Produção
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Mapa dos setores e canteiros, histórico de plantio e registros de colheita em kg.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openPlantingForm}
            className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            + Novo plantio
          </button>
          {isCoord && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                borderRadius: 'var(--radius)',
              }}
            >
              + Novo registro
            </button>
          )}
        </div>
      </div>

      {/* Restricted notice for volunteers */}
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
          Você está visualizando os dados como voluntário. O cadastro de novos registros é restrito ao coordenador.
          O histórico de plantio, manejo e colheita dos canteiros está aberto a toda a equipe.
        </div>
      )}

      {canteiroFeedback && (
        <div
          role={canteiroFeedback.type === 'error' ? 'alert' : 'status'}
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: canteiroFeedback.type === 'error' ? '#fdf0ec' : '#eaf4ec',
            border: `1px solid ${canteiroFeedback.type === 'error' ? '#e2a090' : '#6aaa7a'}`,
            borderRadius: 'var(--radius)',
            color: canteiroFeedback.type === 'error' ? '#8a3b12' : '#1e4d2b',
          }}
        >
          {canteiroFeedback.message}
        </div>
      )}

      {plantingFeedback && (
        <div
          role={plantingFeedback.type === 'error' ? 'alert' : 'status'}
          className="mb-4 px-4 py-3 text-sm"
          style={{
            background: plantingFeedback.type === 'error' ? '#fdf0ec' : '#eaf4ec',
            border: `1px solid ${plantingFeedback.type === 'error' ? '#e2a090' : '#6aaa7a'}`,
            borderRadius: 'var(--radius)',
            color: plantingFeedback.type === 'error' ? '#8a3b12' : '#1e4d2b',
          }}
        >
          {plantingFeedback.message}
        </div>
      )}

      {showPlantingForm && (
        <PlantingRecordForm
          canteiros={canteiros}
          defaultResponsible={user.name}
          onSubmit={handlePlantingSubmit}
          onCancel={() => setShowPlantingForm(false)}
        />
      )}

      <CanteiroMap
        canteiros={canteiros}
        records={records}
        canManage={isCoord}
        onCreate={openNewCanteiroForm}
        onEdit={openEditCanteiroForm}
      >
        {showCanteiroForm && (
          <CanteiroForm
            key={editingCanteiro?.id ?? 'new'}
            canteiro={editingCanteiro}
            sectors={getCanteiroSectors(canteiros)}
            defaultResponsible={user.name}
            onSubmit={handleCanteiroSubmit}
            onCancel={closeCanteiroForm}
          />
        )}
      </CanteiroMap>

      <PlantingHistory records={records} canteiros={canteiros} />

      <div className="pt-6 mb-6" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-xl mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
          Produção em kg
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Registro de alimentos e compostagem em kg.
        </p>
      </div>

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
          Registro salvo com sucesso para {today().split('-').reverse().join('/')}.
        </div>
      )}

      {/* Production form */}
      {showForm && isCoord && (
        <div
          className="mb-6 p-5"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <h3 className="text-base mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Novo registro de produção
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-40">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              >
                {PRODUCTION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                placeholder="ex: 12.5"
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary totals */}
      <div
        className="mb-6 p-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Total acumulado — {totalKg.toFixed(1)} kg
        </p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(byType).map(([t, kg]) => (
            <div key={t} className="flex items-center gap-2">
              <TypeBadge type={t} />
              <span className="text-sm font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {kg.toFixed(1)} kg
              </span>
            </div>
          ))}
        </div>
        {/* Progress bar visual */}
        <div className="mt-4 h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--muted)' }}>
          {Object.entries(byType).map(([t, kg]) => (
            <div
              key={t}
              style={{
                width: `${(kg / totalKg) * 100}%`,
                background: TYPE_COLORS[t] ?? 'var(--muted-foreground)',
              }}
              title={`${t}: ${kg.toFixed(1)} kg`}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium">{filtered.length} registros</p>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2 py-1.5 outline-none"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}
          >
            <option>Todos</option>
            {PRODUCTION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Data', 'Tipo', 'Peso (kg)', 'Registrado por'].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs uppercase tracking-widest font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...filtered].reverse().map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                <td className="px-5 py-3" style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDate(p.date)}
                </td>
                <td className="px-5 py-3">
                  <TypeBadge type={p.type} />
                </td>
                <td className="px-5 py-3 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {p.weightKg.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {p.registeredBy}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
