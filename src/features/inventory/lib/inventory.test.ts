import { describe, expect, it } from 'vitest'
import { INVENTORY_STATUS_LABELS } from '@/shared/constants'
import {
  addInventoryItem,
  createInitialInventoryState,
  getActiveLoans,
  getItemActiveLoans,
  getItemRequesters,
  getItemStatus,
  requestItem,
  returnLoan,
} from './inventory'

const REQUESTED_AT = '2026-11-25T12:00:00.000Z'
const RETURNED_AT = '2026-11-26T09:30:00.000Z'

function getItem(state: ReturnType<typeof createInitialInventoryState>, name: string) {
  const item = state.items.find((candidate) => candidate.name === name)
  if (!item) throw new Error(`Item não encontrado: ${name}`)
  return item
}

describe('operações de estoque', () => {
  it('solicita a retirada, reduz o disponível e registra o solicitante', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')

    const result = requestItem(initial, enxada.id, 2, 'Carlos Eduardo Lima', REQUESTED_AT)

    expect(result.error).toBeNull()
    expect(result.state.items.find((item) => item.id === enxada.id)?.availableQuantity).toBe(2)
    expect(getItemStatus(getItem(result.state, 'Enxada'), result.state.movements)).toBe('solicitada')
    expect(INVENTORY_STATUS_LABELS.solicitada).toBe('Solicitada/Em uso')

    const activeLoans = getActiveLoans(result.state.movements)
    expect(activeLoans).toHaveLength(1)
    expect(activeLoans[0]).toMatchObject({
      itemId: enxada.id,
      itemName: 'Enxada',
      type: 'retirada',
      quantity: 2,
      actor: 'Carlos Eduardo Lima',
      createdAt: REQUESTED_AT,
      status: 'ativa',
    })
    expect(getItemRequesters(result.state.movements, enxada.id)).toEqual(['Carlos Eduardo Lima'])
  })

  it('não altera o estado original ao solicitar a retirada', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')

    requestItem(initial, enxada.id, 1, 'Carlos Eduardo Lima', REQUESTED_AT)

    expect(getItem(initial, 'Enxada').availableQuantity).toBe(4)
    expect(initial.movements).toHaveLength(0)
  })

  it('rejeita retirada acima da quantidade disponível', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')

    const result = requestItem(initial, enxada.id, 5, 'Carlos Eduardo Lima', REQUESTED_AT)

    expect(result.error).toBe('Quantidade indisponível no estoque.')
    expect(result.state).toBe(initial)
    expect(result.state.movements).toHaveLength(0)
  })

  it('rejeita retirada com quantidade inválida', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')

    const result = requestItem(initial, enxada.id, 0, 'Carlos Eduardo Lima', REQUESTED_AT)

    expect(result.error).toBe('Informe uma quantidade inteira maior que zero.')
    expect(result.state).toBe(initial)
  })

  it('registra a devolução, recompõe o estoque e encerra a retirada', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')
    const requested = requestItem(initial, enxada.id, 2, 'Carlos Eduardo Lima', REQUESTED_AT)
    const loan = getActiveLoans(requested.state.movements)[0]

    const returned = returnLoan(requested.state, loan.id, 'Ana Beatriz Costa', RETURNED_AT)

    expect(returned.error).toBeNull()
    const updated = getItem(returned.state, 'Enxada')
    expect(updated.availableQuantity).toBe(4)
    expect(getItemStatus(updated, returned.state.movements)).toBe('disponivel')
    expect(getActiveLoans(returned.state.movements)).toHaveLength(0)
    expect(getItemActiveLoans(returned.state.movements, enxada.id)).toHaveLength(0)
    expect(returned.state.movements).toHaveLength(2)
    expect(returned.state.movements[0].status).toBe('concluida')
    expect(returned.state.movements[1]).toMatchObject({
      itemId: enxada.id,
      type: 'devolucao',
      quantity: 2,
      actor: 'Ana Beatriz Costa',
      status: 'concluida',
      relatedMovementId: loan.id,
      createdAt: RETURNED_AT,
    })
  })

  it('rejeita devolução de uma retirada inexistente ou já concluída', () => {
    const initial = createInitialInventoryState()

    expect(returnLoan(initial, 999, 'Ana Beatriz Costa', RETURNED_AT)).toEqual({
      state: initial,
      error: 'Retirada ativa não encontrada.',
    })
  })

  it('cadastra nova ferramenta e atualiza a quantidade disponível', () => {
    const initial = createInitialInventoryState()

    const result = addInventoryItem(
      initial,
      { name: 'Serrote', category: 'Ferramentas de cultivo', quantity: 3 },
      'Ana Beatriz Costa',
      REQUESTED_AT,
    )

    expect(result.error).toBeNull()
    const serrote = getItem(result.state, 'Serrote')
    expect(serrote).toMatchObject({
      category: 'Ferramentas de cultivo',
      totalQuantity: 3,
      availableQuantity: 3,
    })
    expect(getItemStatus(serrote, result.state.movements)).toBe('disponivel')
    expect(result.state.movements).toHaveLength(1)
    expect(result.state.movements[0]).toMatchObject({
      itemId: serrote.id,
      itemName: 'Serrote',
      type: 'cadastro',
      quantity: 3,
      actor: 'Ana Beatriz Costa',
      status: 'concluida',
      createdAt: REQUESTED_AT,
    })
  })

  it('soma a quantidade quando a ferramenta cadastrada já existe na mesma categoria', () => {
    const initial = createInitialInventoryState()
    const enxada = getItem(initial, 'Enxada')

    const result = addInventoryItem(
      initial,
      { name: 'enxada', category: 'Ferramentas de cultivo', quantity: 2 },
      'Ana Beatriz Costa',
      REQUESTED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.items).toHaveLength(initial.items.length)
    expect(getItem(result.state, 'Enxada')).toMatchObject({
      totalQuantity: enxada.totalQuantity + 2,
      availableQuantity: enxada.availableQuantity + 2,
    })
    expect(result.state.movements[0].itemId).toBe(enxada.id)
  })
})
