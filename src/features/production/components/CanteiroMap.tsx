import type { ReactNode } from 'react'
import type { Canteiro, PlantingRecord } from '@/shared/types'
import { formatDate } from '@/shared/utils'
import { getCanteiroStats, getCanteirosBySector } from '../lib/canteiros'
import { CanteiroStatusBadge } from './CanteiroBadges'

function CanteiroCard({
  canteiro,
  onEdit,
}: {
  canteiro: Canteiro
  onEdit?: (canteiro: Canteiro) => void
}) {
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

      {onEdit && (
        <button
          onClick={() => onEdit(canteiro)}
          aria-label={`Editar ${canteiro.name}`}
          className="mt-3 text-xs font-medium"
          style={{ color: 'var(--primary)' }}
        >
          Editar canteiro
        </button>
      )}
    </article>
  )
}

export function CanteiroMap({
  canteiros,
  records,
  canManage,
  onCreate,
  onEdit,
  children,
}: {
  canteiros: Canteiro[]
  records: PlantingRecord[]
  canManage: boolean
  onCreate: () => void
  onEdit: (canteiro: Canteiro) => void
  children?: ReactNode
}) {
  const sectors = getCanteirosBySector(canteiros)
  const canteiroStats = getCanteiroStats({ canteiros, records })

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

  return (
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {canteiros.length} canteiros em {sectors.length} setores
          </span>
          {canManage && (
            <button
              onClick={onCreate}
              className="px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                borderRadius: 'var(--radius)',
              }}
            >
              + Novo canteiro
            </button>
          )}
        </div>
      </div>

      {children}

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
                <CanteiroCard
                  key={canteiro.id}
                  canteiro={canteiro}
                  onEdit={canManage ? onEdit : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
