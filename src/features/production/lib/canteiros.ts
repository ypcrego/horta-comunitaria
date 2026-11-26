import type {
  Canteiro,
  CanteiroStatus,
  CanteirosState,
  PlantingRecord,
  PlantingRecordType,
} from '@/shared/types'
import { CANTEIRO_STATUSES, INITIAL_CANTEIROS, PLANTING_RECORD_TYPES } from '@/shared/constants'

export interface PlantingOperationResult {
  state: CanteirosState
  error: string | null
}

export interface NewPlantingRecordInput {
  canteiroId: number
  type: PlantingRecordType
  culture: string
  quantityKg: number | null
  notes: string
}

export interface CanteiroSector {
  sector: string
  canteiros: Canteiro[]
}

export interface CanteiroStats {
  total: number
  emCultivo: number
  emPreparo: number
  emDescanso: number
  registros: number
  colhidoKg: number
}

export function isCanteiroStatus(value: unknown): value is CanteiroStatus {
  return CANTEIRO_STATUSES.includes(value as CanteiroStatus)
}

export function isPlantingRecordType(value: unknown): value is PlantingRecordType {
  return PLANTING_RECORD_TYPES.includes(value as PlantingRecordType)
}

export function createInitialCanteirosState(): CanteirosState {
  return {
    canteiros: INITIAL_CANTEIROS.map((canteiro) => ({ ...canteiro })),
    records: [],
  }
}

export function getCanteirosBySector(canteiros: Canteiro[]): CanteiroSector[] {
  const sectors: CanteiroSector[] = []

  for (const canteiro of canteiros) {
    const existing = sectors.find((sector) => sector.sector === canteiro.sector)
    if (existing) {
      existing.canteiros.push(canteiro)
    } else {
      sectors.push({ sector: canteiro.sector, canteiros: [canteiro] })
    }
  }

  return sectors
}

export function getCanteiroStats(state: CanteirosState): CanteiroStats {
  return {
    total: state.canteiros.length,
    emCultivo: state.canteiros.filter((canteiro) => canteiro.status === 'em-cultivo').length,
    emPreparo: state.canteiros.filter((canteiro) => canteiro.status === 'em-preparo').length,
    emDescanso: state.canteiros.filter((canteiro) => canteiro.status === 'em-descanso').length,
    registros: state.records.length,
    colhidoKg: state.records
      .filter((record) => record.type === 'colheita')
      .reduce((total, record) => total + (record.quantityKg ?? 0), 0),
  }
}

function nextRecordId(records: PlantingRecord[]): number {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1
}

function updateCanteiro(
  canteiro: Canteiro,
  input: NewPlantingRecordInput,
  culture: string,
  actor: string,
  createdAt: string,
): Canteiro {
  if (input.type === 'plantio') {
    return {
      ...canteiro,
      currentCulture: culture,
      status: 'em-cultivo',
      responsible: actor,
      plantedAt: createdAt.slice(0, 10),
    }
  }

  if (input.type === 'manejo') {
    return {
      ...canteiro,
      currentCulture: culture,
      responsible: actor,
    }
  }

  return {
    ...canteiro,
    currentCulture: culture,
    status: 'em-descanso',
  }
}

export function addPlantingRecord(
  state: CanteirosState,
  input: NewPlantingRecordInput,
  actor: string,
  createdAt: string = new Date().toISOString(),
): PlantingOperationResult {
  const canteiro = state.canteiros.find((candidate) => candidate.id === input.canteiroId)
  if (!canteiro) {
    return { state, error: 'Canteiro não encontrado.' }
  }
  if (!isPlantingRecordType(input.type)) {
    return { state, error: 'Selecione um tipo de registro válido.' }
  }

  const actorName = actor.trim() || 'Usuário não identificado'
  const informedCulture = input.culture.trim()
  if (input.type === 'plantio' && !informedCulture) {
    return { state, error: 'Informe a cultura do plantio.' }
  }

  const culture = informedCulture || canteiro.currentCulture
  if (!culture) {
    return { state, error: 'Informe a cultura do plantio.' }
  }

  if (input.quantityKg !== null && (!Number.isFinite(input.quantityKg) || input.quantityKg <= 0)) {
    return { state, error: 'Informe uma quantidade maior que zero.' }
  }

  const record: PlantingRecord = {
    id: nextRecordId(state.records),
    canteiroId: canteiro.id,
    canteiroName: canteiro.name,
    sector: canteiro.sector,
    type: input.type,
    culture,
    quantityKg: input.quantityKg,
    notes: input.notes.trim(),
    actor: actorName,
    createdAt,
  }

  return {
    error: null,
    state: {
      canteiros: state.canteiros.map((candidate) =>
        candidate.id === canteiro.id
          ? updateCanteiro(candidate, input, culture, actorName, createdAt)
          : candidate,
      ),
      records: [...state.records, record],
    },
  }
}
