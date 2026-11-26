import { describe, expect, it } from 'vitest'
import { INITIAL_CANTEIROS } from '@/shared/constants'
import {
  addCanteiro,
  addPlantingRecord,
  createInitialCanteirosState,
  filterPlantingRecords,
  getCanteiroSectors,
  getCanteiroStats,
  getCanteirosBySector,
  isCanteiroStatus,
  isPlantingRecordType,
  isValidDateString,
  updateCanteiro,
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

  it('registra data retroativa no histórico e no canteiro', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      {
        canteiroId: 5,
        type: 'plantio',
        culture: 'Milho verde',
        quantityKg: null,
        notes: '',
        date: '2026-10-01',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.records[0].date).toBe('2026-10-01')
    expect(getCanteiro(result.state, 5).plantedAt).toBe('2026-10-01')
  })

  it('rejeita data inválida no registro', () => {
    const initial = createInitialCanteirosState()

    const result = addPlantingRecord(
      initial,
      {
        canteiroId: 1,
        type: 'manejo',
        culture: 'Alface crespa',
        quantityKg: null,
        notes: '',
        date: '2026-02-30',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(result.error).toBe('Informe uma data válida.')
    expect(result.state).toBe(initial)
  })
})

describe('cadastro e edição de canteiros', () => {
  const newCanteiro = {
    name: 'Canteiro 7',
    sector: 'Setor D — Frutíferas',
    currentCulture: 'Mamão',
    status: 'em-preparo' as const,
    responsible: 'Mariana Alves',
    plantedAt: null,
  }

  it('cadastra um novo canteiro sem alterar o estado original', () => {
    const initial = createInitialCanteirosState()

    const result = addCanteiro(initial, newCanteiro)

    expect(result.error).toBeNull()
    expect(getCanteiro(result.state, 7)).toMatchObject(newCanteiro)
    expect(initial.canteiros).toHaveLength(INITIAL_CANTEIROS.length)
  })

  it('rejeita nome duplicado ignorando maiúsculas e minúsculas', () => {
    const initial = createInitialCanteirosState()

    const result = addCanteiro(initial, { ...newCanteiro, name: 'canteiro 1' })

    expect(result.error).toBe('Já existe um canteiro com esse nome.')
    expect(result.state).toBe(initial)
  })

  it('valida setor e responsável obrigatórios', () => {
    const initial = createInitialCanteirosState()

    expect(addCanteiro(initial, { ...newCanteiro, sector: ' ' }).error).toBe(
      'Informe o setor do canteiro.',
    )
    expect(addCanteiro(initial, { ...newCanteiro, responsible: ' ' }).error).toBe(
      'Informe o responsável pelo canteiro.',
    )
  })

  it('edita os dados do canteiro mantendo o id', () => {
    const initial = createInitialCanteirosState()

    const result = updateCanteiro(initial, 1, {
      name: 'Canteiro 1',
      sector: 'Setor A — Hortaliças',
      currentCulture: 'Rúcula',
      status: 'em-descanso',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-11-20',
    })

    expect(result.error).toBeNull()
    expect(getCanteiro(result.state, 1)).toMatchObject({
      id: 1,
      currentCulture: 'Rúcula',
      status: 'em-descanso',
      responsible: 'Carlos Eduardo Lima',
      plantedAt: '2026-11-20',
    })
    expect(getCanteiro(initial, 1).currentCulture).toBe('Alface crespa')
  })

  it('atualiza o nome e o setor nos registros do histórico ao renomear o canteiro', () => {
    const initial = createInitialCanteirosState()
    const planted = addPlantingRecord(
      initial,
      {
        canteiroId: 1,
        type: 'plantio',
        culture: 'Alface crespa',
        quantityKg: null,
        notes: '',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    const result = updateCanteiro(planted.state, 1, {
      name: 'Canteiro Norte',
      sector: 'Setor D — Frutíferas',
      currentCulture: 'Alface crespa',
      status: 'em-cultivo',
      responsible: 'Ana Beatriz Costa',
      plantedAt: '2026-09-12',
    })

    expect(result.error).toBeNull()
    expect(result.state.records[0]).toMatchObject({
      canteiroName: 'Canteiro Norte',
      sector: 'Setor D — Frutíferas',
    })
  })

  it('rejeita a edição de um canteiro inexistente', () => {
    const initial = createInitialCanteirosState()

    const result = updateCanteiro(initial, 999, newCanteiro)

    expect(result.error).toBe('Canteiro não encontrado.')
    expect(result.state).toBe(initial)
  })
})

describe('filtros e utilitários do histórico', () => {
  it('valida datas de calendário', () => {
    expect(isValidDateString('2026-11-25')).toBe(true)
    expect(isValidDateString('2026-02-30')).toBe(false)
    expect(isValidDateString('25/11/2026')).toBe(false)
  })

  it('filtra registros por setor e por canteiro', () => {
    const initial = createInitialCanteirosState()
    const first = addPlantingRecord(
      initial,
      {
        canteiroId: 1,
        type: 'plantio',
        culture: 'Alface crespa',
        quantityKg: null,
        notes: '',
        date: '2026-11-10',
      },
      'Ana Beatriz Costa',
      CREATED_AT,
    )
    const second = addPlantingRecord(
      first.state,
      {
        canteiroId: 5,
        type: 'manejo',
        culture: 'Feijão-de-corda',
        quantityKg: null,
        notes: '',
        date: '2026-11-11',
      },
      'Carlos Eduardo Lima',
      CREATED_AT,
    )

    const records = second.state.records
    expect(filterPlantingRecords(records, { sector: 'Setor A — Hortaliças' })).toHaveLength(1)
    expect(filterPlantingRecords(records, { canteiroId: 5 })[0].canteiroId).toBe(5)
    expect(
      filterPlantingRecords(records, {
        sector: 'Setor B — Raízes e Tubérculos',
        canteiroId: 1,
      }),
    ).toHaveLength(0)
    expect(filterPlantingRecords(records, {})).toHaveLength(2)
  })

  it('lista os setores ecológicos sem repetição', () => {
    const initial = createInitialCanteirosState()

    expect(getCanteiroSectors(initial.canteiros)).toEqual([
      'Setor A — Hortaliças',
      'Setor B — Raízes e Tubérculos',
      'Setor C — Flores e Compostagem',
    ])
  })
})
