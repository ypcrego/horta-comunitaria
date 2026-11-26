import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { CANTEIROS_STORAGE_KEY } from '@/shared/constants'

describe('Fluxo de canteiros no App', () => {
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

  it('registra um plantio e mantém o histórico ao navegar entre as abas', () => {
    render(<App />)
    loginAs('coordenador@ufrn.br')

    fireEvent.click(screen.getByRole('button', { name: /produção/i }))
    expect(screen.getByRole('heading', { level: 3, name: 'Mapa de canteiros' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Canteiro'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Cultura'), { target: { value: 'Rúcula' } })
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Plantio na borda do canteiro.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Plantio registrado no histórico do Canteiro 2.',
    )

    fireEvent.click(screen.getByRole('button', { name: /painel/i }))
    expect(screen.getByText('Últimos registros de produção')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-canteiros-registros')).toHaveTextContent('1')
    expect(
      screen.getByText(/última atividade: plantio de rúcula no canteiro 2, por ana beatriz costa/i),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /produção/i }))
    const history = screen.getByRole('region', { name: 'Histórico de plantio e manejo' })
    expect(within(history).getByText('Canteiro 2')).toBeInTheDocument()
    expect(within(history).getByText('Rúcula')).toBeInTheDocument()
    expect(within(history).getByText('Plantio na borda do canteiro.')).toBeInTheDocument()

    const stored = JSON.parse(window.localStorage.getItem(CANTEIROS_STORAGE_KEY) ?? '{}') as {
      canteiros: { id: number; currentCulture: string }[]
      records: { canteiroId: number; type: string; culture: string; actor: string }[]
    }
    expect(stored.records).toHaveLength(1)
    expect(stored.records[0]).toMatchObject({
      canteiroId: 2,
      type: 'plantio',
      culture: 'Rúcula',
      actor: 'Ana Beatriz Costa',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 2)?.currentCulture).toBe('Rúcula')
  })
})
