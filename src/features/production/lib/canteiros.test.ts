import { describe, expect, it } from 'vitest'
import { INITIAL_CANTEIROS } from '@/shared/constants'
import {
  addPlantingRecord,
  createInitialCanteirosState,
  getCanteiroStats,
  getCanteirosBySector,
  isCanteiroStatus,
  isPlantingRecordType,
} from './canteiros'

const CREATED_AT = '2026-11-25T12:00:00.000Z'

function getCanteiro(state: ReturnType<typeof createInitialCanteirosState>, id: number) {
  const canteiro = state.canteiros.find((candidate) => candidate.id === id)
  if (!canteiro) throw new Error(`Canteiro não encontrado: ${id}`)
  return canteiro
}

describe('mapeamento de canteiros', () => {
  it('cria o estado inicial com os canteiros agrupados por setor ecológico', () => {
    const state = createInitialCanteirosState()
    const sectors = getCanteirosBySector(state.canteiros)

    expect(state.canteiros).toHaveLength(INITIAL_CANTEIROS.length)
    expect(state.records).toEqual([])
    expect(sectors.map((sector) => sector.sector)).toEqual([
      'Setor A — Hortaliças',
      'Setor B — Raízes e Tubérculos',
      'Setor C — Flores e Compostagem',
    ])
    expect(sectors.map((sector) => sector.canteiros.length)).toEqual([3, 2, 1])
  })

  it('calcula os indicadores dos canteiros e o total colhido', () => {
    const initial = createInitialCanteirosState()
    const harvested = addPlantingRecord(
      initial,
      {
        canteiroId: 1,
        type: 'colheita',
        culture: 'Alface crespa',
        quantityKg: 2.5,
        notes: 'Colheita da manhã.',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(getCanteiroStats(initial)).toMatchObject({
      total: 6,
      emCultivo: 4,
      emPreparo: 1,
      emDescanso: 1,
      registros: 0,
      colhidoKg: 0,
    })
    expect(getCanteiroStats(harvested.state)).toMatchObject({
      emCultivo: 3,
      emPreparo: 1,
      emDescanso: 2,
      registros: 1,
      colhidoKg: 2.5,
    })
  })

  it('valida os tipos de status e de registro usados na persistência', () => {
    expect(isCanteiroStatus('em-cultivo')).toBe(true)
    expect(isCanteiroStatus('colhido')).toBe(false)
    expect(isPlantingRecordType('plantio')).toBe(true)
    expect(isPlantingRecordType('irrigacao')).toBe(false)
  })
})

describe('histórico de plantio e manejo', () => {
  it('registra o plantio, atualiza a cultura e ativa o canteiro', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      {
        canteiroId: 5,
        type: 'plantio',
        culture: 'Milho verde',
        quantityKg: null,
        notes: 'Plantio em consórcio.',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(getCanteiro(result.state, 5)).toMatchObject({
      currentCulture: 'Milho verde',
      status: 'em-cultivo',
      responsible: 'Ana Beatriz Costa',
      plantedAt: '2026-11-25',
    })
    expect(result.state.records).toHaveLength(1)
    expect(result.state.records[0]).toMatchObject({
      canteiroId: 5,
      canteiroName: 'Canteiro 5',
      sector: 'Setor B — Raízes e Tubérculos',
      type: 'plantio',
      culture: 'Milho verde',
      quantityKg: null,
      notes: 'Plantio em consórcio.',
      actor: 'Ana Beatriz Costa',
      createdAt: CREATED_AT,
    })
  })

  it('não altera o estado original ao registrar um plantio', () => {
    const initial = createInitialCanteirosState()
    addPlantingRecord(
      initial,
      { canteiroId: 6, type: 'plantio', culture: 'Cravo', quantityKg: null, notes: '' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(getCanteiro(initial, 6)).toMatchObject({
      currentCulture: 'Girassol',
      status: 'em-cultivo',
      responsible: 'Mariana Alves',
    })
    expect(initial.records).toHaveLength(0)
  })

  it('registra manejo, mantém o status e atualiza o responsável', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      {
        canteiroId: 4,
        type: 'manejo',
        culture: 'Batata-doce',
        quantityKg: null,
        notes: 'Adubação orgânica.',
      },
      'Carlos Eduardo Lima',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(getCanteiro(result.state, 4)).toMatchObject({
      currentCulture: 'Batata-doce',
      status: 'em-cultivo',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-08-30',
    })
  })

  it('registra a colheita, coloca o canteiro em descanso e guarda os kg', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      {
        canteiroId: 1,
        type: 'colheita',
        culture: 'Alface crespa',
        quantityKg: 3.2,
        notes: 'Colheita parcial.',
      },
      'Mariana Alves',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(getCanteiro(result.state, 1).status).toBe('em-descanso')
    expect(result.state.records[0]).toMatchObject({
      type: 'colheita',
      quantityKg: 3.2,
      actor: 'Mariana Alves',
    })
  })

  it('usa a cultura atual quando o manejo não informa uma nova cultura', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      { canteiroId: 2, type: 'manejo', culture: '   ', quantityKg: null, notes: '' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.records[0].culture).toBe('Couve-manteiga')
  })

  it('rejeita canteiro inexistente', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      { canteiroId: 999, type: 'plantio', culture: 'Alface', quantityKg: null, notes: '' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBe('Canteiro não encontrado.')
    expect(result.state).toBe(initial)
  })

  it('rejeita plantio sem cultura', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      { canteiroId: 1, type: 'plantio', culture: ' ', quantityKg: null, notes: '' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBe('Informe a cultura do plantio.')
    expect(result.state).toBe(initial)
  })

  it('rejeita quantidade inválida', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      { canteiroId: 1, type: 'colheita', culture: 'Alface crespa', quantityKg: 0, notes: '' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBe('Informe uma quantidade maior que zero.')
    expect(result.state).toBe(initial)
  })
})
