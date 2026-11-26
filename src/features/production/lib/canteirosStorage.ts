import type { Canteiro, CanteirosState, PlantingRecord } from '@/shared/types'
import { CANTEIROS_STORAGE_KEY } from '@/shared/constants'
import {
  createInitialCanteirosState,
  isCanteiroStatus,
  isPlantingRecordType,
} from './canteiros'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isCanteiro(value: unknown): value is Canteiro {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    typeof value.name === 'string' &&
    typeof value.sector === 'string' &&
    typeof value.currentCulture === 'string' &&
    isCanteiroStatus(value.status) &&
    typeof value.responsible === 'string' &&
    (value.plantedAt === null || typeof value.plantedAt === 'string')
  )
}

function isPlantingRecord(value: unknown): value is PlantingRecord {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    isFiniteNumber(value.canteiroId) &&
    typeof value.canteiroName === 'string' &&
    typeof value.sector === 'string' &&
    isPlantingRecordType(value.type) &&
    typeof value.culture === 'string' &&
    (value.quantityKg === null || isFiniteNumber(value.quantityKg)) &&
    typeof value.notes === 'string' &&
    typeof value.actor === 'string' &&
    typeof value.createdAt === 'string'
  )
}

export function isCanteirosState(value: unknown): value is CanteirosState {
  if (!isRecord(value)) return false
  if (!Array.isArray(value.canteiros) || !Array.isArray(value.records)) return false
  return value.canteiros.every(isCanteiro) && value.records.every(isPlantingRecord)
}

export function loadCanteirosState(): CanteirosState {
  if (typeof window === 'undefined') {
    return createInitialCanteirosState()
  }

  try {
    const rawState = window.localStorage.getItem(CANTEIROS_STORAGE_KEY)
    if (!rawState) return createInitialCanteirosState()

    const parsed: unknown = JSON.parse(rawState)
    return isCanteirosState(parsed) ? parsed : createInitialCanteirosState()
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
