import { describe, expect, it, vi } from 'vitest'
import type { PlantingRecord } from '@/shared/types'
import { addPlantingRecord, createInitialCanteirosState } from './canteiros'
import { HISTORY_CSV_HEADERS, buildHistoryCsv, downloadHistoryCsv } from './canteirosExport'

function sampleRecord(): PlantingRecord {
  const planted = addPlantingRecord(
    createInitialCanteirosState(),
    {
      canteiroId: 1,
      type: 'colheita',
      culture: 'Alface crespa',
      quantityKg: 2.5,
      notes: 'Mudas com "aspas"; e quebra\nde linha.',
      date: '2026-11-10',
    },
    'Ana Beatriz Costa',
    '2026-11-25T12:00:00.000Z',
  )
  const record = planted.state.records[0]
  if (!record) throw new Error('Registro não criado')
  return record
}

describe('exportação do histórico em CSV', () => {
  it('gera o cabeçalho e uma linha por registro com escape de CSV', () => {
    const csv = buildHistoryCsv([sampleRecord()])

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain(HISTORY_CSV_HEADERS.map((header) => `"${header}"`).join(';'))
    expect(csv).toContain('"10/11/2026"')
    expect(csv).toContain('"Canteiro 1"')
    expect(csv).toContain('"Setor A — Hortaliças"')
    expect(csv).toContain('"Colheita"')
    expect(csv).toContain('"Alface crespa"')
    expect(csv).toContain('"2,5"')
    expect(csv).toContain('"Mudas com ""aspas""; e quebra\nde linha."')
    expect(csv).toContain('"Ana Beatriz Costa"')
    expect(csv.split('\r\n')).toHaveLength(3)
  })

  it('exporta apenas o cabeçalho quando não há registros', () => {
    const csv = buildHistoryCsv([])

    expect(csv).toBe(
      `\uFEFF${HISTORY_CSV_HEADERS.map((header) => `"${header}"`).join(';')}\r\n`,
    )
  })

  it('dispara o download do CSV no navegador', () => {
    const createObjectURL = vi.fn(() => 'blob:historico')
    const revokeObjectURL = vi.fn()
    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    try {
      expect(downloadHistoryCsv([sampleRecord()], 'historico-teste.csv')).toBe(true)
      expect(createObjectURL).toHaveBeenCalledTimes(1)
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:historico')
      expect(click).toHaveBeenCalledTimes(1)
    } finally {
      click.mockRestore()
      if (originalCreate) {
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          value: originalCreate,
        })
      } else {
        Reflect.deleteProperty(URL, 'createObjectURL')
      }
      if (originalRevoke) {
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          value: originalRevoke,
        })
      } else {
        Reflect.deleteProperty(URL, 'revokeObjectURL')
      }
    }
  })
})
