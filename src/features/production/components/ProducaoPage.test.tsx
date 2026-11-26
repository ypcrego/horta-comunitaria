import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { CanteirosState, Production, User } from '@/shared/types'
import { CANTEIROS_STORAGE_KEY } from '@/shared/constants'
import { ProducaoPage } from './ProducaoPage'

const coordinator: User = {
  name: 'Ana Beatriz Costa',
  email: 'coordenador@ufrn.br',
  role: 'coordenador',
}

const volunteer: User = {
  name: 'Carlos Eduardo Lima',
  email: 'voluntario@ufrn.br',
  role: 'voluntario',
}

function renderPage(user: User = coordinator, productions: Production[] = []) {
  const onAdd = vi.fn()
  render(<ProducaoPage user={user} productions={productions} onAdd={onAdd} />)
  return { onAdd }
}

function storedState() {
  const raw = window.localStorage.getItem(CANTEIROS_STORAGE_KEY)
  if (!raw) throw new Error('Canteiros não encontrados no localStorage')
  return JSON.parse(raw) as CanteirosState
}

describe('ProducaoPage — canteiros e histórico', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('exibe o mapa com setores, cultura atual, status e responsável de cada canteiro', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 3, name: 'Mapa de canteiros' })).toBeInTheDocument()
    expect(screen.getByText('Setor A — Hortaliças')).toBeInTheDocument()
    expect(screen.getByText('Setor B — Raízes e Tubérculos')).toBeInTheDocument()
    expect(screen.getByText('Setor C — Flores e Compostagem')).toBeInTheDocument()
    expect(screen.getByText('6 canteiros em 3 setores')).toBeInTheDocument()

    const canteiro1 = screen.getByRole('article', { name: 'Canteiro 1' })
    expect(within(canteiro1).getByText('Alface crespa')).toBeInTheDocument()
    expect(within(canteiro1).getByText('Em cultivo')).toBeInTheDocument()
    expect(within(canteiro1).getByText('Ana Beatriz Costa')).toBeInTheDocument()
    expect(within(canteiro1).getByText('12/09/2026')).toBeInTheDocument()

    const canteiro5 = screen.getByRole('article', { name: 'Canteiro 5' })
    expect(within(canteiro5).getByText('Feijão-de-corda')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Em descanso')).toBeInTheDocument()

    expect(screen.getByTestId('canteiro-stat-total')).toHaveTextContent('6')
    expect(screen.getByTestId('canteiro-stat-cultivo')).toHaveTextContent('4')
    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('0')
  })

  it('registra um plantio, atualiza os indicadores e persiste no localStorage', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    expect(
      screen.getByRole('heading', { level: 3, name: 'Novo registro no histórico dos canteiros' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Canteiro'), { target: { value: '5' } })
    expect(screen.getByLabelText('Cultura')).toHaveValue('Feijão-de-corda')

    fireEvent.change(screen.getByLabelText('Cultura'), { target: { value: 'Milho verde' } })
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Plantio em consórcio com feijão.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Plantio registrado no histórico do Canteiro 5.',
    )

    const canteiro5 = screen.getByRole('article', { name: 'Canteiro 5' })
    expect(within(canteiro5).getByText('Milho verde')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Em cultivo')).toBeInTheDocument()
    expect(within(canteiro5).getByText('Ana Beatriz Costa')).toBeInTheDocument()

    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('1')
    expect(screen.getByTestId('canteiro-stat-cultivo')).toHaveTextContent('5')
    expect(screen.getByTestId('canteiro-stat-descanso')).toHaveTextContent('1')

    const history = screen.getByRole('region', { name: 'Histórico de plantio e manejo' })
    expect(within(history).getByText('Canteiro 5')).toBeInTheDocument()
    expect(within(history).getByText('Milho verde')).toBeInTheDocument()
    expect(within(history).getByText('Plantio')).toBeInTheDocument()
    expect(within(history).getByText('Plantio em consórcio com feijão.')).toBeInTheDocument()
    expect(within(history).getByText('Ana Beatriz Costa')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.records).toHaveLength(1)
    expect(stored.records[0]).toMatchObject({
      canteiroId: 5,
      type: 'plantio',
      culture: 'Milho verde',
      actor: 'Ana Beatriz Costa',
      notes: 'Plantio em consórcio com feijão.',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 5)?.status).toBe('em-cultivo')

    cleanup()
    renderPage()

    expect(screen.getByTestId('canteiro-stat-registros')).toHaveTextContent('1')
    expect(
      within(screen.getByRole('article', { name: 'Canteiro 5' })).getByText('Milho verde'),
    ).toBeInTheDocument()
  })

  it('permite que o voluntário registre manejo sem liberar o cadastro de produção', () => {
    renderPage(volunteer)

    expect(screen.queryByRole('button', { name: '+ Novo registro' })).not.toBeInTheDocument()
    expect(
      screen.getByText(/o histórico de plantio, manejo e colheita dos canteiros está aberto/i),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Tipo de registro'), { target: { value: 'manejo' } })
    fireEvent.change(screen.getByLabelText('Observações'), {
      target: { value: 'Capina manual e cobertura do solo.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Manejo registrado no histórico do Canteiro 1.',
    )

    const stored = storedState()
    expect(stored.records[0]).toMatchObject({
      canteiroId: 1,
      type: 'manejo',
      actor: 'Carlos Eduardo Lima',
      notes: 'Capina manual e cobertura do solo.',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 1)?.responsible).toBe(
      'Carlos Eduardo Lima',
    )
  })

  it('registra colheita com quantidade, coloca o canteiro em descanso e soma os kg', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo plantio' }))
    fireEvent.change(screen.getByLabelText('Tipo de registro'), { target: { value: 'colheita' } })

    const quantityInput = screen.getByLabelText('Quantidade colhida (kg)')
    fireEvent.change(quantityInput, { target: { value: '2.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar no histórico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Colheita registrada no histórico do Canteiro 1.',
    )

    const canteiro1 = screen.getByRole('article', { name: 'Canteiro 1' })
    expect(within(canteiro1).getByText('Em descanso')).toBeInTheDocument()
    expect(screen.getByTestId('canteiro-stat-descanso')).toHaveTextContent('3')
    expect(screen.getByText('2.5 kg colhidos')).toBeInTheDocument()

    const stored = storedState()
    expect(stored.records[0]).toMatchObject({
      canteiroId: 1,
      type: 'colheita',
      quantityKg: 2.5,
      actor: 'Ana Beatriz Costa',
    })
    expect(stored.canteiros.find((canteiro) => canteiro.id === 1)?.status).toBe('em-descanso')
  })
})
