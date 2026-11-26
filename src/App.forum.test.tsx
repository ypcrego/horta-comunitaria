import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { FORUM_STORAGE_KEY } from '@/shared/constants'

describe('Fluxo do fórum no App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-26T12:00:00Z'))
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

  it('cria tópico, responde e mantém o conteúdo ao navegar entre as abas', () => {
    render(<App />)
    loginAs('voluntario@ufrn.br')

    fireEvent.click(screen.getByRole('button', { name: /fórum/i }))
    expect(screen.getByRole('heading', { level: 2, name: 'Fórum' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+ Novo tópico' }))
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Dúvida sobre irrigação' },
    })
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'Dúvidas' },
    })
    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: 'Qual o melhor horário para regar os canteiros?' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Publicar tópico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Tópico "Dúvida sobre irrigação" publicado no fórum.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dúvida sobre irrigação' }))
    const detail = screen.getByRole('region', { name: 'Tópico Dúvida sobre irrigação' })
    fireEvent.change(within(detail).getByLabelText('Resposta'), {
      target: { value: 'O ideal é regar no início da manhã ou no fim da tarde.' },
    })
    fireEvent.click(within(detail).getByRole('button', { name: 'Enviar resposta' }))

    expect(screen.getByRole('status')).toHaveTextContent('Resposta publicada no tópico.')

    fireEvent.click(screen.getByRole('button', { name: /painel/i }))
    expect(screen.getByText('Últimos registros de produção')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /fórum/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Dúvida sobre irrigação' }))

    expect(
      screen.getByText('O ideal é regar no início da manhã ou no fim da tarde.'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Carlos Eduardo Lima').length).toBeGreaterThan(0)

    const stored = JSON.parse(window.localStorage.getItem(FORUM_STORAGE_KEY) ?? '{}') as {
      topics: { title: string; replies: { author: string; message: string }[] }[]
    }
    const topic = stored.topics.find((candidate) => candidate.title === 'Dúvida sobre irrigação')
    expect(topic).toBeDefined()
    expect(topic?.replies[0]).toMatchObject({
      author: 'Carlos Eduardo Lima',
      message: 'O ideal é regar no início da manhã ou no fim da tarde.',
    })
  })
})
