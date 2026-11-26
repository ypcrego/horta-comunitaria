import type { Canteiro, CanteirosState, PlantingRecord } from '@/shared/types'
import { CANTEIROS_STORAGE_KEY } from '@/shared/constants'
import {
  createInitialCanteirosState,
  isCanteiroStatus,
  isPlantingRecordType,
  isValidDateString,
} from './canteiros'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNotNull<Value>(value: Value | null): value is Value {
  return value !== null
}

function normalizeCanteiro(value: unknown): Canteiro | null {
  if (!isRecord(value)) return null
  if (
    !isFiniteNumber(value.id) ||
    typeof value.name !== 'string' ||
    typeof value.sector !== 'string' ||
    typeof value.currentCulture !== 'string' ||
    !isCanteiroStatus(value.status) ||
    typeof value.responsible !== 'string' ||
    !(value.plantedAt === null || isValidDateString(value.plantedAt))
  ) {
    return null
  }

  return {
    id: value.id,
    name: value.name,
    sector: value.sector,
    currentCulture: value.currentCulture,
    status: value.status,
    responsible: value.responsible,
    plantedAt: value.plantedAt,
  }
}

function normalizePlantingRecord(value: unknown): PlantingRecord | null {
  if (!isRecord(value)) return null
  if (
    !isFiniteNumber(value.id) ||
    !isFiniteNumber(value.canteiroId) ||
    typeof value.canteiroName !== 'string' ||
    typeof value.sector !== 'string' ||
    !isPlantingRecordType(value.type) ||
    typeof value.culture !== 'string' ||
    !(value.quantityKg === null || isFiniteNumber(value.quantityKg)) ||
    typeof value.notes !== 'string' ||
    typeof value.actor !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    return null
  }

  const legacyDate = value.createdAt.slice(0, 10)
  let date: string | null = null
  if (typeof value.date === 'string') {
    date = value.date
  } else if (isValidDateString(legacyDate)) {
    date = legacyDate
  }
  if (!isValidDateString(date)) return null

  return {
    id: value.id,
    canteiroId: value.canteiroId,
    canteiroName: value.canteiroName,
    sector: value.sector,
    type: value.type,
    culture: value.culture,
    date,
    quantityKg: value.quantityKg,
    notes: value.notes,
    actor: value.actor,
    createdAt: value.createdAt,
  }
}

function normalizeCanteirosState(value: unknown): CanteirosState | null {
  if (!isRecord(value)) return null
  if (!Array.isArray(value.canteiros) || !Array.isArray(value.records)) return null

  const canteiros = value.canteiros.map(normalizeCanteiro)
  if (canteiros.some((canteiro) => canteiro === null)) return null

  const records = value.records.map(normalizePlantingRecord)
  if (records.some((record) => record === null)) return null

  return {
    canteiros: canteiros.filter(isNotNull),
    records: records.filter(isNotNull),
  }
}

export function isCanteirosState(value: unknown): value is CanteirosState {
  return normalizeCanteirosState(value) !== null
}

export function loadCanteirosState(): CanteirosState {
  if (typeof window === 'undefined') {
    return createInitialCanteirosState()
  }

  try {
    const rawState = window.localStorage.getItem(CANTEIROS_STORAGE_KEY)
    if (!rawState) return createInitialCanteirosState()

    const parsed: unknown = JSON.parse(rawState)
    return normalizeCanteirosState(parsed) ?? createInitialCanteirosState()
  } catch {
    return createInitialCanteirosState()
  }
}

export function saveCanteirosState(state: CanteirosState): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(CANTEIROS_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearCanteirosState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CANTEIROS_STORAGE_KEY)
  } catch {
    // Ignora ambientes em que o localStorage não está disponível.
  }
}
