import type { PlantingRecord } from '@/shared/types'
import { PLANTING_RECORD_TYPE_LABELS } from '@/shared/constants'
import { formatDate, formatDateTime } from '@/shared/utils'

export const HISTORY_CSV_HEADERS = [
  'Data',
  'Canteiro',
  'Setor',
  'Tipo',
  'Cultura',
  'Quantidade (kg)',
  'Observações',
  'Responsável',
  'Registrado em',
]

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function buildHistoryCsv(records: PlantingRecord[]): string {
  const lines = [
    HISTORY_CSV_HEADERS.map(csvCell).join(';'),
    ...records.map((record) =>
      [
        formatDate(record.date),
        record.canteiroName,
        record.sector,
        PLANTING_RECORD_TYPE_LABELS[record.type],
        record.culture,
        record.quantityKg === null ? '' : record.quantityKg.toFixed(1).replace('.', ','),
        record.notes,
        record.actor,
        formatDateTime(record.createdAt),
      ]
        .map(csvCell)
        .join(';'),
    ),
  ]

  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function downloadHistoryCsv(
  records: PlantingRecord[],
  filename = 'historico-canteiros.csv',
): boolean {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false
  }

  try {
    const blob = new Blob([buildHistoryCsv(records)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url)
    return true
  } catch {
    return false
  }
}
