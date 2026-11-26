import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ForumState, User } from '@/shared/types'
import { FORUM_STORAGE_KEY } from '@/shared/constants'
import { ForumPage } from './ForumPage'

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

function renderPage(user: User = volunteer) {
  render(<ForumPage user={user} />)
}

function storedState() {
  const raw = window.localStorage.getItem(FORUM_STORAGE_KEY)
  if (!raw) throw new Error('Fórum não encontrado no localStorage')
  return JSON.parse(raw) as ForumState
}

describe('ForumPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('lista os tópicos, respostas e categorias do fórum', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 2, name: 'Fórum' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mutirão de limpeza e preparo dos canteiros' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Dúvida sobre adubação orgânica no Canteiro 3' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Comunicado: nova escala de rega' }),
    ).toBeInTheDocument()

    expect(screen.getByTestId('forum-stat-topics')).toHaveTextContent('3')
    expect(screen.getByTestId('forum-stat-replies')).toHaveTextContent('3')
    expect(screen.getByTestId('forum-stat-categories')).toHaveTextContent('3')

    expect(screen.getByRole('button', { name: 'Todas (3)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comunicados (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mutirões (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dúvidas (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plantio e manejo (0)' })).toBeInTheDocument()
  })

  it('cria um novo tópico e mantém os dados após remontar a página', () => {
    renderPage(volunteer)

    fireEvent.click(screen.getByRole('button', { name: '+ Novo tópico' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Novo tópico' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: '  Oficina de compostagem  ' },
    })
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'Mutirões' },
    })
    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: 'Vamos nos encontrar no sábado pela manhã.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Publicar tópico' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Tópico "Oficina de compostagem" publicado no fórum.',
    )
    expect(screen.getByTestId('forum-stat-topics')).toHaveTextContent('4')

    const topicCard = screen.getByRole('article', {
      name: 'Tópico: Oficina de compostagem',
    })
    expect(within(topicCard).getByText('Mutirões')).toBeInTheDocument()
    expect(within(topicCard).getByText(/por Carlos Eduardo Lima/)).toBeInTheDocument()
    expect(within(topicCard).getByText('Vamos nos encontrar no sábado pela manhã.')).toBeInTheDocument()
    expect(screen.getAllByRole('article')[0]).toBe(topicCard)

    const stored = storedState()
    expect(stored.topics.find((topic) => topic.title === 'Oficina de compostagem')).toMatchObject({
      category: 'Mutirões',
      author: 'Carlos Eduardo Lima',
      message: 'Vamos nos encontrar no sábado pela manhã.',
      replies: [],
    })

    cleanup()
    renderPage(volunteer)

    expect(
      screen.getByRole('button', { name: 'Oficina de compostagem' }),
    ).toBeInTheDocument()
  })

  it('filtra os tópicos por categoria', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Dúvidas (1)' }))

    expect(
      screen.getByRole('article', { name: 'Tópico: Dúvida sobre adubação orgânica no Canteiro 3' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('article', { name: 'Tópico: Comunicado: nova escala de rega' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Todas (3)' }))

    expect(
      screen.getByRole('article', { name: 'Tópico: Comunicado: nova escala de rega' }),
    ).toBeInTheDocument()
  })

  it('abre um tópico, publica uma resposta e exibe autor e data', () => {
    renderPage(coordinator)

    fireEvent.click(screen.getByRole('button', { name: 'Comunicado: nova escala de rega' }))

    const detail = screen.getByRole('region', {
      name: 'Tópico Comunicado: nova escala de rega',
    })
    expect(
      screen.getByRole('heading', { level: 3, name: 'Comunicado: nova escala de rega' }),
    ).toHaveFocus()
    expect(
      within(detail).getByText('Nenhuma resposta ainda. Seja a primeira pessoa a comentar.'),
    ).toBeInTheDocument()

    fireEvent.change(within(detail).getByLabelText('Resposta'), {
      target: { value: 'Posso cobrir a manhã de quinta-feira.' },
    })
    fireEvent.click(within(detail).getByRole('button', { name: 'Enviar resposta' }))

    expect(screen.getByRole('status')).toHaveTextContent('Resposta publicada no tópico.')
    expect(within(detail).getByText('Posso cobrir a manhã de quinta-feira.')).toBeInTheDocument()
    expect(within(detail).getAllByText('Ana Beatriz Costa').length).toBeGreaterThan(0)
    expect(within(detail).getAllByText(/\d{2}\/\d{2}\/\d{4}/).length).toBeGreaterThanOrEqual(2)

    const stored = storedState()
    expect(
      stored.topics.find((topic) => topic.id === 3)?.replies[0],
    ).toMatchObject({
      author: 'Ana Beatriz Costa',
      message: 'Posso cobrir a manhã de quinta-feira.',
    })

    fireEvent.click(within(detail).getByRole('button', { name: '← Voltar ao fórum' }))

    expect(screen.getByRole('button', { name: 'Comunicado: nova escala de rega' })).toHaveFocus()

    const topicCard = screen.getByRole('article', {
      name: 'Tópico: Comunicado: nova escala de rega',
    })
    expect(within(topicCard).getByText('1 resposta')).toBeInTheDocument()
    expect(screen.getByTestId('forum-stat-replies')).toHaveTextContent('4')
  })
})
