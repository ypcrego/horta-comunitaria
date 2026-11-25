import { beforeEach, describe, expect, it } from 'vitest'
import { INVENTORY_STORAGE_KEY, INITIAL_INVENTORY_ITEMS } from '@/shared/constants'
import { createInitialInventoryState, getItemStatus, requestItem } from './inventory'
import {
  clearInventoryState,
  isInventoryState,
  loadInventoryState,
  saveInventoryState,
} from './inventoryStorage'

describe('persistência do estoque em localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('salva e restaura itens e movimentações', () => {
    const initial = createInitialInventoryState()
    const enxada = initial.items.find((item) => item.name === 'Enxada')
    if (!enxada) throw new Error('Enxada não encontrada')

    const requested = requestItem(
      initial,
      enxada.id,
      1,
      'Carlos Eduardo Lima',
      '2026-11-25T12:00:00.000Z',
    )

    expect(saveInventoryState(requested.state)).toBe(true)

    const restored = loadInventoryState()
    expect(restored.items.find((item) => item.id === enxada.id)?.availableQuantity).toBe(3)
    expect(restored.movements).toHaveLength(1)
    expect(restored.movements[0]).toMatchObject({
      type: 'retirada',
      actor: 'Carlos Eduardo Lima',
      status: 'ativa',
    })
    expect(getItemStatus(restored.items[0], restored.movements)).toBe('solicitada')
  })

  it('usa o estoque inicial quando ainda não há dados salvos', () => {
    const restored = loadInventoryState()
    expect(restored.items).toHaveLength(INITIAL_INVENTORY_ITEMS.length)
    expect(restored.items[0]).toEqual(INITIAL_INVENTORY_ITEMS[0])
    expect(restored.movements).toEqual([])
  })

  it('ignora dados inválidos ou corrompidos', () => {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, '{conteudo-invalido')

    const restored = loadInventoryState()
    expect(restored.items).toHaveLength(INITIAL_INVENTORY_ITEMS.length)
    expect(restored.movements).toEqual([])
  })

  it('ignora um estado com formato inesperado', () => {
    window.localStorage.setItem(
      INVENTORY_STORAGE_KEY,
      JSON.stringify({ items: [{ id: 'x' }], movements: [] }),
    )

    expect(isInventoryState({ items: [{ id: 'x' }], movements: [] })).toBe(false)
    expect(loadInventoryState().movements).toEqual([])
    expect(loadInventoryState().items).toHaveLength(INITIAL_INVENTORY_ITEMS.length)
  })

  it('remove o estado salvo do localStorage', () => {
    saveInventoryState(createInitialInventoryState())
    expect(window.localStorage.getItem(INVENTORY_STORAGE_KEY)).not.toBeNull()

    clearInventoryState()

    expect(window.localStorage.getItem(INVENTORY_STORAGE_KEY)).toBeNull()
  })
})
