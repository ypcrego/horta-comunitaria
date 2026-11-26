import { describe, expect, it } from 'vitest'
import { nextId } from './id'

describe('nextId', () => {
  it('retorna 1 quando a lista está vazia', () => {
    expect(nextId([])).toBe(1)
  })

  it('retorna o maior id incrementado, não o tamanho da lista', () => {
    expect(nextId([{ id: 1 }, { id: 5 }, { id: 3 }])).toBe(6)
  })

  it('funciona com ids sequenciais', () => {
    expect(nextId([{ id: 1 }, { id: 2 }, { id: 3 }])).toBe(4)
  })

  it('não altera a lista original', () => {
    const items = [{ id: 2 }, { id: 8 }]

    nextId(items)

    expect(items).toEqual([{ id: 2 }, { id: 8 }])
  })
})
