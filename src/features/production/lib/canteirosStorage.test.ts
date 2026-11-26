import { beforeEach, describe, expect, it } from 'vitest'
import { CANTEIROS_STORAGE_KEY, INITIAL_CANTEIROS } from '@/shared/constants'
import {
  addCanteiro,
  addPlantingRecord,
  createInitialCanteirosState,
  updateCanteiro,
} from './canteiros'
import {
  clearCanteirosState,
  isCanteirosState,
  loadCanteirosState,
  saveCanteirosState,
} from './canteirosStorage'

const CREATED_AT = '2026-11-25T12:00:00.000Z'

describe('persistência dos canteiros em localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('salva e restaura os canteiros e o histórico de plantio', () => {
    const initial = createInitialCanteirosState()
    const planted = addPlantingRecord(
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

    expect(saveCanteirosState(planted.state)).toBe(true)

    const restored = loadCanteirosState()
    expect(restored.canteiros.find((canteiro) => canteiro.id === 5)).toMatchObject({
      currentCulture: 'Milho verde',
      status: 'em-cultivo',
      responsible: 'Ana Beatriz Costa',
    })
    expect(restored.records).toHaveLength(1)
    expect(restored.records[0]).toMatchObject({
      type: 'plantio',
      culture: 'Milho verde',
      actor: 'Ana Beatriz Costa',
    })
  })

  it('usa os canteiros iniciais quando ainda não há dados salvos', () => {
    const restored = loadCanteirosState()

    expect(restored.canteiros).toHaveLength(INITIAL_CANTEIROS.length)
    expect(restored.canteiros[0]).toEqual(INITIAL_CANTEIROS[0])
    expect(restored.records).toEqual([])
  })

  it('ignora dados corrompidos', () => {
    window.localStorage.setItem(CANTEIROS_STORAGE_KEY, '{conteudo-invalido')

    const restored = loadCanteirosState()

    expect(restored.canteiros).toHaveLength(INITIAL_CANTEIROS.length)
    expect(restored.records).toEqual([])
  })

  it('ignora um estado com formato inesperado', () => {
    const invalidState = { canteiros: [{ id: 'x' }], records: [] }
    window.localStorage.setItem(CANTEIROS_STORAGE_KEY, JSON.stringify(invalidState))

    expect(isCanteirosState(invalidState)).toBe(false)
    expect(loadCanteirosState().canteiros).toHaveLength(INITIAL_CANTEIROS.length)
    expect(loadCanteirosState().records).toEqual([])
  })

  it('remove o estado salvo do localStorage', () => {
    saveCanteirosState(createInitialCanteirosState())
    expect(window.localStorage.getItem(CANTEIROS_STORAGE_KEY)).not.toBeNull()

    clearCanteirosState()

    expect(window.localStorage.getItem(CANTEIROS_STORAGE_KEY)).toBeNull()
  })

  it('migra registros antigos sem data usando a data de criação', () => {
    const planted = addPlantingRecord(
      createInitialCanteirosState(),
      {
        canteiroId: 5,
        type: 'plantio',
        culture: 'Milho verde',
        quantityKg: null,
        notes: '',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )
    const legacy = JSON.parse(JSON.stringify(planted.state)) as {
      canteiros: unknown[]
      records: Record<string, unknown>[]
    }
    delete legacy.records[0].date
    window.localStorage.setItem(CANTEIROS_STORAGE_KEY, JSON.stringify(legacy))

    expect(isCanteirosState(legacy)).toBe(true)
    const restored = loadCanteirosState()
    expect(restored.records[0].date).toBe('2026-11-25')
  })

  it('ignora registros com data inválida', () => {
    const planted = addPlantingRecord(
      createInitialCanteirosState(),
      {
        canteiroId: 1,
        type: 'manejo',
        culture: 'Alface crespa',
        quantityKg: null,
        notes: '',
        date: '2026-11-10',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )
    window.localStorage.setItem(
      CANTEIROS_STORAGE_KEY,
      JSON.stringify({
        ...planted.state,
        records: [{ ...planted.state.records[0], date: '2026-02-30' }],
      }),
    )

    const restored = loadCanteirosState()
    expect(restored.records).toEqual([])
    expect(restored.canteiros).toHaveLength(INITIAL_CANTEIROS.length)
  })

  it('persiste o cadastro e a edição de canteiros', () => {
    const initial = createInitialCanteirosState()
    const created = addCanteiro(initial, {
      name: 'Canteiro 7',
      sector: 'Setor D — Frutíferas',
      currentCulture: 'Mamão',
      status: 'em-preparo',
      responsible: 'Mariana Alves',
      plantedAt: null,
    })
    expect(created.error).toBeNull()
    saveCanteirosState(created.state)

    const updated = updateCanteiro(created.state, 7, {
      name: 'Canteiro 7',
      sector: 'Setor D — Frutíferas',
      currentCulture: 'Mamão',
      status: 'em-cultivo',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-11-20',
    })
    expect(updated.error).toBeNull()
    saveCanteirosState(updated.state)

    const restored = loadCanteirosState()
    expect(restored.canteiros.find((canteiro) => canteiro.id === 7)).toMatchObject({
      currentCulture: 'Mamão',
      status: 'em-cultivo',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-11-20',
    })
  })
})
