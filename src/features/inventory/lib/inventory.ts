import type {
  InventoryItem,
  InventoryItemStatus,
  InventoryMovement,
  InventoryState,
} from '@/shared/types'
import { INITIAL_INVENTORY_ITEMS } from '@/shared/constants'

export interface InventoryOperationResult {
  state: InventoryState
  error: string | null
}

export interface NewInventoryItemInput {
  name: string
  category: string
  quantity: number
}

export function createInitialInventoryState(): InventoryState {
  return {
    items: INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item })),
    movements: [],
  }
}

export function getActiveLoans(movements: InventoryMovement[]): InventoryMovement[] {
  return movements.filter((movement) => movement.type === 'retirada' && movement.status === 'ativa')
}

export function getItemActiveLoans(
  movements: InventoryMovement[],
  itemId: number,
): InventoryMovement[] {
  return getActiveLoans(movements).filter((movement) => movement.itemId === itemId)
}

export function getItemRequesters(movements: InventoryMovement[], itemId: number): string[] {
  return [...new Set(getItemActiveLoans(movements, itemId).map((movement) => movement.actor))]
}

export function getItemStatus(item: InventoryItem, movements: InventoryMovement[]): InventoryItemStatus {
  const hasActiveLoan = getItemActiveLoans(movements, item.id).length > 0
  return hasActiveLoan || item.availableQuantity <= 0 ? 'solicitada' : 'disponivel'
}

function nextItemId(items: InventoryItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function nextMovementId(movements: InventoryMovement[]): number {
  return movements.reduce((max, movement) => Math.max(max, movement.id), 0) + 1
}

function validQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0
}

export function requestItem(
  state: InventoryState,
  itemId: number,
  quantity: number,
  requester: string,
  createdAt: string = new Date().toISOString(),
): InventoryOperationResult {
  const item = state.items.find((candidate) => candidate.id === itemId)
  if (!item) {
    return { state, error: 'Ferramenta não encontrada.' }
  }
  if (!validQuantity(quantity)) {
    return { state, error: 'Informe uma quantidade inteira maior que zero.' }
  }
  if (quantity > item.availableQuantity) {
    return { state, error: 'Quantidade indisponível no estoque.' }
  }

  const movement: InventoryMovement = {
    id: nextMovementId(state.movements),
    itemId: item.id,
    itemName: item.name,
    type: 'retirada',
    quantity,
    actor: requester.trim() || 'Usuário não identificado',
    createdAt,
    status: 'ativa',
  }

  return {
    error: null,
    state: {
      items: state.items.map((candidate) =>
        candidate.id === itemId
          ? { ...candidate, availableQuantity: candidate.availableQuantity - quantity }
          : candidate,
      ),
      movements: [...state.movements, movement],
    },
  }
}

export function returnLoan(
  state: InventoryState,
  loanId: number,
  actor: string,
  returnedAt: string = new Date().toISOString(),
): InventoryOperationResult {
  const loan = state.movements.find(
    (movement) => movement.id === loanId && movement.type === 'retirada' && movement.status === 'ativa',
  )
  if (!loan) {
    return { state, error: 'Retirada ativa não encontrada.' }
  }

  const item = state.items.find((candidate) => candidate.id === loan.itemId)
  if (!item) {
    return { state, error: 'Ferramenta não encontrada.' }
  }

  const returnMovement: InventoryMovement = {
    id: nextMovementId(state.movements),
    itemId: loan.itemId,
    itemName: loan.itemName,
    type: 'devolucao',
    quantity: loan.quantity,
    actor: actor.trim() || 'Usuário não identificado',
    createdAt: returnedAt,
    status: 'concluida',
    relatedMovementId: loan.id,
  }

  return {
    error: null,
    state: {
      items: state.items.map((candidate) =>
        candidate.id === loan.itemId
          ? {
              ...candidate,
              availableQuantity: Math.min(
                candidate.totalQuantity,
                candidate.availableQuantity + loan.quantity,
              ),
            }
          : candidate,
      ),
      movements: [
        ...state.movements.map((movement) =>
          movement.id === loan.id ? { ...movement, status: 'concluida' as const } : movement,
        ),
        returnMovement,
      ],
    },
  }
}

export function addInventoryItem(
  state: InventoryState,
  input: NewInventoryItemInput,
  actor: string,
  createdAt: string = new Date().toISOString(),
): InventoryOperationResult {
  const name = input.name.trim()
  if (!name) {
    return { state, error: 'Informe o nome da ferramenta.' }
  }
  if (!validQuantity(input.quantity)) {
    return { state, error: 'Informe uma quantidade inteira maior que zero.' }
  }

  const category = input.category.trim() || 'Ferramentas de cultivo'
  const existing = state.items.find(
    (item) =>
      item.name.trim().toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR') &&
      item.category === category,
  )

  const movement: InventoryMovement = {
    id: nextMovementId(state.movements),
    itemId: existing?.id ?? nextItemId(state.items),
    itemName: existing?.name ?? name,
    type: 'cadastro',
    quantity: input.quantity,
    actor: actor.trim() || 'Usuário não identificado',
    createdAt,
    status: 'concluida',
  }

  const items = existing
    ? state.items.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              totalQuantity: item.totalQuantity + input.quantity,
              availableQuantity: item.availableQuantity + input.quantity,
            }
          : item,
      )
    : [
        ...state.items,
        {
          id: movement.itemId,
          name,
          category,
          totalQuantity: input.quantity,
          availableQuantity: input.quantity,
        },
      ]

  return {
    error: null,
    state: {
      items,
      movements: [...state.movements, movement],
    },
  }
}
