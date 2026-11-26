import { useState } from 'react'
import type { Canteiro, PlantingRecord } from '@/shared/types'
import { formatDate, formatDateTime, today } from '@/shared/utils'
import {
  filterPlantingRecords,
  getCanteiroSectors,
} from '../lib/canteiros'
import { downloadHistoryCsv } from '../lib/canteirosExport'
import { PlantingRecordBadge } from './CanteiroBadges'

type Feedback = {
  type: 'success' | 'error'
  message: string
}

export function PlantingHistory({
  records,
  canteiros,
}: {
  records: PlantingRecord[]
  canteiros: Canteiro[]
}) {
  const [sectorFilter, setSectorFilter] = useState('todos')
  const [canteiroFilter, setCanteiroFilter] = useState('todos')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const sectors = getCanteiroSectors(canteiros)
  const canteirosForFilter =
    sectorFilter === 'todos'
      ? canteiros
      : canteiros.filter((canteiro) => canteiro.sector === sectorFilter)
  const filteredRecords = filterPlantingRecords(records, {
    sector: sectorFilter === 'todos' ? null : sectorFilter,
    canteiroId: canteiroFilter === 'todos' ? null : Number.parseInt(canteiroFilter, 10),
  })
  const hasFilters = sectorFilter !== 'todos' || canteiroFilter !== 'todos'

  function handleSectorChange(value: string) {
    setSectorFilter(value)
    setCanteiroFilter('todos')
    setFeedback(null)
  }

  function handleCanteiroChange(value: string) {
    setCanteiroFilter(value)
    setFeedback(null)
  }

  function clearFilters() {
    setSectorFilter('todos')
    setCanteiroFilter('todos')
    setFeedback(null)
  }

  function handleExport() {
    if (filteredRecords.length === 0) return

    const exported = downloadHistoryCsv(
      filteredRecords,
      `historico-canteiros-${today()}.csv`,
    )
    setFeedback(
      exported
        ? {
            type: 'success',
            message: `Histórico exportado com ${filteredRecords.length} ${
              filteredRecords.length === 1 ? 'registro' : 'registros'
            }.`,
          }
        : {
            type: 'error',
            message: 'Não foi possível exportar o histórico neste navegador.',
          },
    )
  }

  return (
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
        <div className="flex flex-wrap items-center gap-3">
          <span
            data-testid="history-count"
            className="text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {filteredRecords.length === records.length
              ? `${records.length} ${records.length === 1 ? 'registro' : 'registros'}`
              : `${filteredRecords.length} de ${records.length} registros`}
          </span>
          <button
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div
        className="flex flex-wrap items-end gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="w-52">
          <label
            htmlFor="history-sector-filter"
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Filtrar por setor
          </label>
          <select
            id="history-sector-filter"
            value={sectorFilter}
            onChange={(e) => handleSectorChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm outline-none"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}
          >
            <option value="todos">Todos os setores</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        <div className="w-52">
          <label
            htmlFor="history-canteiro-filter"
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Filtrar por canteiro
          </label>
          <select
            id="history-canteiro-filter"
            value={canteiroFilter}
            onChange={(e) => handleCanteiroChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm outline-none"
            style={{
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--foreground)',
            }}
          >
            <option value="todos">Todos os canteiros</option>
            {canteirosForFilter.map((canteiro) => (
              <option key={canteiro.id} value={canteiro.id}>
                {canteiro.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 text-xs"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Limpar filtros
          </button>
        )}

        {feedback && (
          <p
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className="text-xs pb-1.5"
            style={{ color: feedback.type === 'error' ? '#8a3b12' : '#1e4d2b' }}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {records.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Nenhum registro de plantio, manejo ou colheita ainda.
        </p>
      ) : filteredRecords.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Nenhum registro para os filtros selecionados.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Data', 'Canteiro', 'Tipo', 'Cultura', 'Qtd. (kg)', 'Responsável'].map(
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
            {[...filteredRecords].reverse().map((record) => (
              <tr key={record.id} style={{ borderBottom: '1px solid var(--muted)' }}>
                <td
                  className="px-5 py-3 text-xs"
                  title={`Registrado em ${formatDateTime(record.createdAt)}`}
                  style={{ color: 'var(--muted-foreground)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatDate(record.date)}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium">{record.canteiroName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {record.sector}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <PlantingRecordBadge type={record.type} />
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
  )
}
