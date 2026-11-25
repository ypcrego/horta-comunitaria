import type { InventoryItem, InventoryMovement, InventoryState } from '@/shared/types'
import { INVENTORY_STORAGE_KEY } from '@/shared/constants'
import { createInitialInventoryState } from './inventory'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isInventoryItem(value: unknown): value is InventoryItem {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    typeof value.name === 'string' &&
    typeof value.category === 'string' &&
    isFiniteNumber(value.totalQuantity) &&
    isFiniteNumber(value.availableQuantity)
  )
}

function isInventoryMovement(value: unknown): value is InventoryMovement {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    isFiniteNumber(value.itemId) &&
    typeof value.itemName === 'string' &&
    (value.type === 'retirada' || value.type === 'devolucao' || value.type === 'cadastro') &&
    isFiniteNumber(value.quantity) &&
    typeof value.actor === 'string' &&
    typeof value.createdAt === 'string' &&
    (value.status === 'ativa' || value.status === 'concluida') &&
    (value.relatedMovementId === undefined || isFiniteNumber(value.relatedMovementId))
  )
}

export function isInventoryState(value: unknown): value is InventoryState {
  if (!isRecord(value)) return false
  if (!Array.isArray(value.items) || !Array.isArray(value.movements)) return false
  return value.items.every(isInventoryItem) && value.movements.every(isInventoryMovement)
}

export function loadInventoryState(): InventoryState {
  if (typeof window === 'undefined') {
    return createInitialInventoryState()
  }

  try {
    const rawState = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!rawState) return createInitialInventoryState()

    const parsed: unknown = JSON.parse(rawState)
    return isInventoryState(parsed) ? parsed : createInitialInventoryState()
  } catch {
    return createInitialInventoryState()
  }
}

export function saveInventoryState(state: InventoryState): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearInventoryState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(INVENTORY_STORAGE_KEY)
  } catch {
    // Ignora ambientes em que o localStorage não está disponível.
  }
}
