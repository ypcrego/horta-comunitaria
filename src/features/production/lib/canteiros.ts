import type {
  Canteiro,
  CanteiroStatus,
  CanteirosState,
  PlantingRecord,
  PlantingRecordType,
} from '@/shared/types'
import { CANTEIRO_STATUSES, INITIAL_CANTEIROS, PLANTING_RECORD_TYPES } from '@/shared/constants'

export interface CanteirosOperationResult {
  state: CanteirosState
  error: string | null
}

export type PlantingOperationResult = CanteirosOperationResult

export interface NewPlantingRecordInput {
  canteiroId: number
  type: PlantingRecordType
  culture: string
  quantityKg: number | null
  notes: string
  date?: string
}

export interface NewCanteiroInput {
  name: string
  sector: string
  currentCulture: string
  status: CanteiroStatus
  responsible: string
  plantedAt: string | null
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

export interface PlantingHistoryFilters {
  canteiroId?: number | null
  sector?: string | null
}

interface ValidatedCanteiroInput {
  name: string
  sector: string
  currentCulture: string
  status: CanteiroStatus
  responsible: string
  plantedAt: string | null
}

export function isCanteiroStatus(value: unknown): value is CanteiroStatus {
  return CANTEIRO_STATUSES.includes(value as CanteiroStatus)
}

export function isPlantingRecordType(value: unknown): value is PlantingRecordType {
  return PLANTING_RECORD_TYPES.includes(value as PlantingRecordType)
}

export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
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

export function getCanteiroSectors(canteiros: Canteiro[]): string[] {
  return [...new Set(canteiros.map((canteiro) => canteiro.sector))]
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

export function filterPlantingRecords(
  records: PlantingRecord[],
  filters: PlantingHistoryFilters,
): PlantingRecord[] {
  const canteiroId = filters.canteiroId ?? null
  const sector = filters.sector ?? null

  return records.filter(
    (record) =>
      (canteiroId === null || record.canteiroId === canteiroId) &&
      (sector === null || record.sector === sector),
  )
}

function nextRecordId(records: PlantingRecord[]): number {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1
}

function nextCanteiroId(canteiros: Canteiro[]): number {
  return canteiros.reduce((max, canteiro) => Math.max(max, canteiro.id), 0) + 1
}

function applyPlantingToCanteiro(
  canteiro: Canteiro,
  input: NewPlantingRecordInput,
  culture: string,
  actor: string,
  date: string,
): Canteiro {
  if (input.type === 'plantio') {
    return {
      ...canteiro,
      currentCulture: culture,
      status: 'em-cultivo',
      responsible: actor,
      plantedAt: date,
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

function validateCanteiroInput(
  state: CanteirosState,
  input: NewCanteiroInput,
  ignoreId: number | null = null,
): { value: ValidatedCanteiroInput | null; error: string | null } {
  const name = input.name.trim()
  if (!name) {
    return { value: null, error: 'Informe o nome do canteiro.' }
  }

  const duplicated = state.canteiros.some(
    (canteiro) =>
      canteiro.id !== ignoreId &&
      canteiro.name.trim().toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'),
  )
  if (duplicated) {
    return { value: null, error: 'Já existe um canteiro com esse nome.' }
  }

  const sector = input.sector.trim()
  if (!sector) {
    return { value: null, error: 'Informe o setor do canteiro.' }
  }

  if (!isCanteiroStatus(input.status)) {
    return { value: null, error: 'Selecione um status válido.' }
  }

  const responsible = input.responsible.trim()
  if (!responsible) {
    return { value: null, error: 'Informe o responsável pelo canteiro.' }
  }

  const plantedAt = input.plantedAt?.trim() || null
  if (plantedAt !== null && !isValidDateString(plantedAt)) {
    return { value: null, error: 'Informe uma data de plantio válida.' }
  }

  return {
    value: {
      name,
      sector,
      currentCulture: input.currentCulture.trim(),
      status: input.status,
      responsible,
      plantedAt,
    },
    error: null,
  }
}

export function addCanteiro(
  state: CanteirosState,
  input: NewCanteiroInput,
): CanteirosOperationResult {
  const validation = validateCanteiroInput(state, input)
  if (!validation.value) {
    return { state, error: validation.error }
  }

  const canteiro: Canteiro = {
    id: nextCanteiroId(state.canteiros),
    ...validation.value,
  }

  return {
    error: null,
    state: {
      ...state,
      canteiros: [...state.canteiros, canteiro],
    },
  }
}

export function updateCanteiro(
  state: CanteirosState,
  canteiroId: number,
  input: NewCanteiroInput,
): CanteirosOperationResult {
  const existing = state.canteiros.find((canteiro) => canteiro.id === canteiroId)
  if (!existing) {
    return { state, error: 'Canteiro não encontrado.' }
  }

  const validation = validateCanteiroInput(state, input, canteiroId)
  if (!validation.value) {
    return { state, error: validation.error }
  }

  const updated: Canteiro = {
    ...existing,
    ...validation.value,
  }

  return {
    error: null,
    state: {
      canteiros: state.canteiros.map((canteiro) =>
        canteiro.id === canteiroId ? updated : canteiro,
      ),
      records: state.records.map((record) =>
        record.canteiroId === canteiroId
          ? { ...record, canteiroName: updated.name, sector: updated.sector }
          : record,
      ),
    },
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

  const recordDate = input.date?.trim() || createdAt.slice(0, 10)
  if (!isValidDateString(recordDate)) {
    return { state, error: 'Informe uma data válida.' }
  }

  const record: PlantingRecord = {
    id: nextRecordId(state.records),
    canteiroId: canteiro.id,
    canteiroName: canteiro.name,
    sector: canteiro.sector,
    type: input.type,
    culture,
    date: recordDate,
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
          ? applyPlantingToCanteiro(candidate, input, culture, actorName, recordDate)
          : candidate,
      ),
      records: [...state.records, record],
    },
  }
}
