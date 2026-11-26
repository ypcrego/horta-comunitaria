import type { CanteiroStatus, PlantingRecordType } from '@/shared/types'
import { CANTEIRO_STATUS_LABELS, PLANTING_RECORD_TYPE_LABELS } from '@/shared/constants'

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

export function CanteiroStatusBadge({ status }: { status: CanteiroStatus }) {
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

export function PlantingRecordBadge({ type }: { type: PlantingRecordType }) {
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
