import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { User } from '@/shared/types'
import { INVENTORY_STORAGE_KEY } from '@/shared/constants'
import { EstoquePage } from './EstoquePage'

const volunteer: User = {
  name: 'Carlos Eduardo Lima',
  email: 'voluntario@ufrn.br',
  role: 'voluntario',
}

const coordinator: User = {
  name: 'Ana Beatriz Costa',
  email: 'coordenador@ufrn.br',
  role: 'coordenador',
}

function storedInventory() {
  const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
  if (!raw) throw new Error('Estoque não encontrado no localStorage')
  return JSON.parse(raw) as {
    items: { id: number; name: string; availableQuantity: number; totalQuantity: number }[]
    movements: { type: string; actor: string; quantity: number; status: string }[]
  }
}

describe('EstoquePage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('permite que o voluntário solicite uma ferramenta e exibe o solicitante', () => {
    render(<EstoquePage user={volunteer} />)

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar retirada de Enxada' }))

    expect(screen.getByText('Retirar: Enxada')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))

    expect(screen.getByText('Solicitada/Em uso')).toBeInTheDocument()
    expect(screen.getByText('2 de 4 disponíveis')).toBeInTheDocument()
    expect(screen.getAllByText('Carlos Eduardo Lima').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /registrar devolução/i })).not.toBeInTheDocument()

    const stored = storedInventory()
    expect(stored.items.find((item) => item.name === 'Enxada')?.availableQuantity).toBe(2)
    expect(stored.movements[0]).toMatchObject({
      type: 'retirada',
      actor: 'Carlos Eduardo Lima',
      quantity: 2,
      status: 'ativa',
    })
  })

  it('impede o voluntário de cadastrar novas ferramentas', () => {
    render(<EstoquePage user={volunteer} />)

    expect(screen.queryByRole('button', { name: /\+ nova ferramenta/i })).not.toBeInTheDocument()
    expect(screen.getByText(/cadastro de novos itens e o registro de devoluções são restritos/i)).toBeInTheDocument()
  })

  it('permite que o coordenador cadastre uma ferramenta e atualiza o estoque', () => {
    render(<EstoquePage user={coordinator} />)

    fireEvent.click(screen.getByRole('button', { name: /\+ nova ferramenta/i }))
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Serrote' } })
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: /cadastrar ferramenta/i }))

    const serroteCard = screen.getByRole('article', { name: 'Ferramenta Serrote' })
    expect(within(serroteCard).getByText('Serrote')).toBeInTheDocument()
    expect(within(serroteCard).getByText('3 de 3 disponíveis')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/quantidade disponível no estoque foi atualizada/i)

    const stored = storedInventory()
    expect(stored.items.find((item) => item.name === 'Serrote')).toMatchObject({
      availableQuantity: 3,
      totalQuantity: 3,
    })
    expect(stored.movements[0]).toMatchObject({
      type: 'cadastro',
      actor: 'Ana Beatriz Costa',
      quantity: 3,
      status: 'concluida',
    })
  })

  it('permite que o coordenador registre a devolução e recompõe o estoque', () => {
    render(<EstoquePage user={coordinator} />)

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar retirada de Enxada' }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))
    expect(screen.getByText('3 de 4 disponíveis')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Registrar devolução de Enxada para Ana Beatriz Costa',
      }),
    )

    expect(screen.getByText('4 de 4 disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma ferramenta em uso no momento.')).toBeInTheDocument()
    expect(screen.queryByText('Solicitada/Em uso')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/devolução registrada/i)

    const stored = storedInventory()
    expect(stored.items.find((item) => item.name === 'Enxada')?.availableQuantity).toBe(4)
    expect(stored.movements.map((movement) => movement.type)).toEqual(['retirada', 'devolucao'])
    expect(stored.movements[0].status).toBe('concluida')
  })

  it('exibe erro quando a quantidade solicitada é maior que o disponível', () => {
    render(<EstoquePage user={volunteer} />)

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar retirada de Carrinho de mão' }))
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /confirmar solicitação/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Quantidade indisponível no estoque.')
    expect(window.localStorage.getItem(INVENTORY_STORAGE_KEY)).toBeNull()
  })
})
