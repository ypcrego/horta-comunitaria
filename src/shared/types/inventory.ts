export type InventoryMovementType = 'retirada' | 'devolucao' | 'cadastro'

export type InventoryMovementStatus = 'ativa' | 'concluida'

export type InventoryItemStatus = 'disponivel' | 'solicitada'

export interface InventoryItem {
  id: number
  name: string
  category: string
  totalQuantity: number
  availableQuantity: number
}

export interface InventoryMovement {
  id: number
  itemId: number
  itemName: string
  type: InventoryMovementType
  quantity: number
  actor: string
  createdAt: string
  status: InventoryMovementStatus
  relatedMovementId?: number
}

export interface InventoryState {
  items: InventoryItem[]
  movements: InventoryMovement[]
}
