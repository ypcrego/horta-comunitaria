import type { InventoryItem, InventoryItemStatus, InventoryMovementType } from '../types'

export const INVENTORY_STORAGE_KEY = 'horta-comunitaria:inventory:v1'

export const INVENTORY_CATEGORIES = [
  'Ferramentas de cultivo',
  'Irrigação',
  'Transporte',
  'Proteção',
] as const

export const INVENTORY_STATUS_LABELS: Record<InventoryItemStatus, string> = {
  disponivel: 'Disponível',
  solicitada: 'Solicitada/Em uso',
}

export const INVENTORY_MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  retirada: 'Retirada',
  devolucao: 'Devolução',
  cadastro: 'Cadastro',
}

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: 'Enxada',
    category: 'Ferramentas de cultivo',
    totalQuantity: 4,
    availableQuantity: 4,
  },
  {
    id: 2,
    name: 'Regador 10 L',
    category: 'Irrigação',
    totalQuantity: 3,
    availableQuantity: 3,
  },
  {
    id: 3,
    name: 'Pá de jardim',
    category: 'Ferramentas de cultivo',
    totalQuantity: 2,
    availableQuantity: 2,
  },
  {
    id: 4,
    name: 'Tesoura de poda',
    category: 'Ferramentas de cultivo',
    totalQuantity: 2,
    availableQuantity: 2,
  },
  {
    id: 5,
    name: 'Carrinho de mão',
    category: 'Transporte',
    totalQuantity: 1,
    availableQuantity: 1,
  },
  {
    id: 6,
    name: 'Luvas de proteção',
    category: 'Proteção',
    totalQuantity: 6,
    availableQuantity: 6,
  },
]
