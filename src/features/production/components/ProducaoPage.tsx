import { useState } from 'react'
import type React from 'react'
import type {
  Canteiro,
  CanteiroStatus,
  PlantingRecordType,
  Production,
  User,
} from '@/shared/types'
import {
  CANTEIRO_STATUS_LABELS,
  PLANTING_RECORD_TYPES,
  PLANTING_RECORD_TYPE_LABELS,
  PRODUCTION_TYPES,
  TYPE_COLORS,
} from '@/shared/constants'
import { today, formatDate, formatDateTime } from '@/shared/utils'
import { TypeBadge } from '@/shared/components'
import { useCanteiros } from '../hooks/useCanteiros'
import { getCanteiroStats, getCanteirosBySector } from '../lib/canteiros'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

const CANTEIRO_STATUS_STYLES: Record<
  CanteiroStatus,
  { background: string; border: string; color: string }
> = {
  'em-cultivo': { background: '#eaf4ec', border: '#6aaa7a', color: '#1e4d2b' },
  'em-preparo': { background: '#eef2f7', border: '#9db4c9', color: '#33506b' },
  'em-descanso': { background: '#fdf5e6', border: '#d4a84b', color: '#7a5c00' },
}

const RECORD_TYPE_STYLES: Record<
  PlantingRecordType,
  { background: string; border: string; color: string }
> = {
  plantio: { background: '#eaf4ec', border: '#6aaa7a', color: '#1e4d2b' },
  manejo: { background: '#eef2f7', border: '#9db4c9', color: '#33506b' },
  colheita: { background: '#fdf0ec', border: '#e2a090', color: '#8a3b12' },
}

const RECORD_FEEDBACK_LABELS: Record<PlantingRecordType, string> = {
  plantio: 'Plantio registrado',
  manejo: 'Manejo registrado',
  colheita: 'Colheita registrada',
}

function CanteiroStatusBadge({ status }: { status: CanteiroStatus }) {
  const style = CANTEIRO_STATUS_STYLES[status]
  return (
    <span
      className="text-xs px-2 py-0.5 shrink-0"
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {CANTEIRO_STATUS_LABELS[status]}
    </span>
  )
}

function RecordTypeBadge({ type }: { type: PlantingRecordType }) {
  const style = RECORD_TYPE_STYLES[type]
  return (
    <span
      className="text-xs px-2 py-0.5"
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        color: style.color,
        borderRadius: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {PLANTING_RECORD_TYPE_LABELS[type]}
    </span>
  )
}

function CanteiroCard({ canteiro }: { canteiro: Canteiro }) {
  return (
    <article
      aria-label={canteiro.name}
      className="p-4"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        maxWidth: 340,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h5 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
          {canteiro.name}
        </h5>
        <CanteiroStatusBadge status={canteiro.status} />
      </div>

      <dl className="space-y-1.5 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            Cultura atual
          </dt>
          <dd className="text-right font-medium">{canteiro.currentCulture || '—'}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            Responsável
          </dt>
          <dd className="text-right">{canteiro.responsible}</dd>
        </div>
        {canteiro.plantedAt && (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>
              Plantado em
            </dt>
            <dd className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatDate(canteiro.plantedAt)}
            </dd>
          </div>
        )}
      </dl>
    </article>
  )
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
  const { canteiros, records, registerRecord } = useCanteiros()
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState(PRODUCTION_TYPES[0])
  const [weight, setWeight] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterType, setFilterType] = useState('Todos')

  const [showPlantingForm, setShowPlantingForm] = useState(false)
  const [selectedCanteiroId, setSelectedCanteiroId] = useState<number>(canteiros[0]?.id ?? 0)
  const [recordType, setRecordType] = useState<PlantingRecordType>('plantio')
  const [recordCulture, setRecordCulture] = useState('')
  const [recordQuantity, setRecordQuantity] = useState('')
  const [recordNotes, setRecordNotes] = useState('')
  const [plantingFeedback, setPlantingFeedback] = useState<Feedback | null>(null)

  const isCoord = user.role === 'coordenador'

  const totalKg = productions.reduce((s, p) => s + p.weightKg, 0)
  const byType: Record<string, number> = {}
  for (const p of productions) {
    byType[p.type] = (byType[p.type] ?? 0) + p.weightKg
  }

  const filtered = filterType === 'Todos' ? productions : productions.filter((p) => p.type === filterType)

  const sectors = getCanteirosBySector(canteiros)
  const canteiroStats = getCanteiroStats({ canteiros, records })
  const selectedCanteiro = canteiros.find((canteiro) => canteiro.id === selectedCanteiroId) ?? null

  const stats = [
    {
      id: 'total',
      label: 'Canteiros mapeados',
      value: String(canteiroStats.total),
      sub: `${sectors.length} setores ecológicos`,
    },
    {
      id: 'cultivo',
      label: 'Em cultivo',
      value: String(canteiroStats.emCultivo),
      sub: 'culturas ativas',
    },
    {
      id: 'descanso',
      label: 'Em preparo/descanso',
      value: String(canteiroStats.emPreparo + canteiroStats.emDescanso),
      sub: `${canteiroStats.emPreparo} em preparo · ${canteiroStats.emDescanso} em descanso`,
    },
    {
      id: 'registros',
      label: 'Registros no histórico',
      value: String(canteiroStats.registros),
      sub:
        canteiroStats.colhidoKg > 0
          ? `${canteiroStats.colhidoKg.toFixed(1)} kg colhidos`
          : 'plantio, manejo e colheita',
    },
  ]

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

    const firstCanteiro = canteiros[0]
    setSelectedCanteiroId(firstCanteiro?.id ?? 0)
    setRecordType('plantio')
    setRecordCulture(firstCanteiro?.currentCulture ?? '')
    setRecordQuantity('')
    setRecordNotes('')
    setPlantingFeedback(null)
    setShowPlantingForm(true)
  }

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

  function handlePlantingSubmit(e: React.FormEvent) {
    e.preventDefault()
    const quantity =
      recordType === 'colheita' && recordQuantity.trim() !== ''
        ? Number.parseFloat(recordQuantity)
        : null

    const error = registerRecord(
      {
        canteiroId: selectedCanteiroId,
        type: recordType,
        culture: recordCulture,
        quantityKg: quantity,
        notes: recordNotes,
      },
      user.name,
    )

    if (error) {
      setPlantingFeedback({ type: 'error', message: error })
      return
    }

    setPlantingFeedback({
      type: 'success',
      message: `${RECORD_FEEDBACK_LABELS[recordType]} no histórico do ${
        selectedCanteiro?.name ?? 'canteiro'
      }.`,
    })
    setShowPlantingForm(false)
    setRecordQuantity('')
    setRecordNotes('')
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

      {/* Planting record form */}
      {showPlantingForm && (
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
          <form onSubmit={handlePlantingSubmit}>
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
                Responsável: <strong style={{ color: 'var(--foreground)' }}>{user.name}</strong>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlantingForm(false)}
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
      )}

      {/* Canteiro map */}
      <section className="mb-8" aria-label="Mapa de canteiros">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xl" style={{ fontFamily: 'Fraunces, serif' }}>
              Mapa de canteiros
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Setores ecológicos com cultura atual, status e responsável por canteiro.
            </p>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {canteiros.length} canteiros em {sectors.length} setores
          </span>
        </div>

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
                data-testid={`canteiro-stat-${stat.id}`}
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

        <div className="space-y-5">
          {sectors.map((sector) => (
            <div key={sector.sector}>
              <div
                className="flex items-center justify-between gap-2 pb-2 mb-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h4 className="text-sm font-semibold">{sector.sector}</h4>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {sector.canteiros.length}{' '}
                  {sector.canteiros.length === 1 ? 'canteiro' : 'canteiros'}
                </span>
              </div>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
              >
                {sector.canteiros.map((canteiro) => (
                  <CanteiroCard key={canteiro.id} canteiro={canteiro} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Planting history */}
      <section
        aria-label="Histórico de plantio e manejo"
        className="mb-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-base" style={{ fontFamily: 'Fraunces, serif' }}>
              Histórico de plantio e manejo
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Registros salvos no localStorage deste navegador.
            </p>
          </div>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {records.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Nenhum registro de plantio, manejo ou colheita ainda.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data/hora', 'Canteiro', 'Tipo', 'Cultura', 'Qtd. (kg)', 'Responsável'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left px-5 py-3 text-xs uppercase tracking-widest font-medium"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[...records].reverse().map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                  <td
                    className="px-5 py-3 text-xs"
                    style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatDateTime(record.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{record.canteiroName}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {record.sector}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <RecordTypeBadge type={record.type} />
                  </td>
                  <td className="px-5 py-3">
                    <p>{record.culture}</p>
                    {record.notes && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                        {record.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {record.quantityKg === null ? '—' : record.quantityKg.toFixed(1)}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {record.actor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
