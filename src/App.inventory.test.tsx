import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { INVENTORY_STORAGE_KEY } from '@/shared/constants'

describe('Fluxo de estoque no App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'))
  })

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
    window.localStorage.clear()
  })

  function loginAs(email: string, pass = 'senha123') {
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: email } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: pass } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    act(() => {
      vi.advanceTimersByTime(650)
    })
  }

  it('abre a aba Estoque, registra a solicitação do voluntário e mantém os dados ao navegar', () => {
    render(<App />)
    loginAs('voluntario@ufrn.br')

    fireEvent.click(screen.getByRole('button', { name: /estoque/i }))
    expect(screen.getByRole('heading', { level: 2, name: 'Estoque' })).toBeInTheDocument()
    expect(screen.getByText('Enxada')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar retirada de Enxada' }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))

    expect(screen.getByText('Solicitada/Em uso')).toBeInTheDocument()
    expect(screen.getAllByText('Carlos Eduardo Lima').length).toBeGreaterThan(0)
    expect(screen.getByText('3 de 4 disponíveis')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /painel/i }))
    fireEvent.click(screen.getByRole('button', { name: /estoque/i }))

    expect(screen.getByText('Solicitada/Em uso')).toBeInTheDocument()
    expect(screen.getByText('3 de 4 disponíveis')).toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem(INVENTORY_STORAGE_KEY) ?? '{}') as {
      items: { name: string; availableQuantity: number }[]
      movements: { type: string; actor: string }[]
    }
    expect(stored.items.find((item) => item.name === 'Enxada')?.availableQuantity).toBe(3)
    expect(stored.movements[0]).toMatchObject({
      type: 'retirada',
      actor: 'Carlos Eduardo Lima',
    })
  })
})
