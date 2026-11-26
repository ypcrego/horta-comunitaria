import { describe, expect, it } from 'vitest'
import type { ForumCategory } from '@/shared/types'
import { INITIAL_FORUM_TOPICS } from '@/shared/constants'
import {
  addReply,
  addTopic,
  createInitialForumState,
  filterTopics,
  getForumStats,
  getTopicLastActivity,
  isForumCategory,
  sortTopicsByActivity,
} from './forum'

const CREATED_AT = '2026-11-25T12:00:00.000Z'
const REPLIED_AT = '2026-11-26T09:30:00.000Z'

describe('tópicos do fórum', () => {
  it('cria o estado inicial com os tópicos e respostas de exemplo', () => {
    const state = createInitialForumState()

    expect(state.topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
    expect(state.topics[0].replies).toHaveLength(2)
    expect(state.topics[0].title).toBe('Mutirão de limpeza e preparo dos canteiros')
  })

  it('cadastra um novo tópico com autor e data', () => {
    const initial = createInitialForumState()

    const result = addTopic(
      initial,
      {
        title: '  Oficina de compostagem  ',
        category: 'Mutirões',
        message: '  Vamos nos encontrar no sábado pela manhã.  ',
      },
      'Carlos Eduardo Lima',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.topics).toHaveLength(initial.topics.length + 1)
    expect(result.state.topics[result.state.topics.length - 1]).toMatchObject({
      id: 4,
      title: 'Oficina de compostagem',
      category: 'Mutirões',
      message: 'Vamos nos encontrar no sábado pela manhã.',
      author: 'Carlos Eduardo Lima',
      createdAt: CREATED_AT,
      replies: [],
    })
    expect(initial.topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
  })

  it('rejeita tópico sem título, mensagem ou categoria válida', () => {
    const initial = createInitialForumState()

    expect(
      addTopic(initial, { title: ' ', category: 'Dúvidas', message: 'Mensagem' }, 'Ana').error,
    ).toBe('Informe o título do tópico.')
    expect(
      addTopic(initial, { title: 'Título', category: 'Dúvidas', message: ' ' }, 'Ana').error,
    ).toBe('Escreva a mensagem do tópico.')
    expect(
      addTopic(
        initial,
        { title: 'Título', category: 'Eventos' as ForumCategory, message: 'Mensagem' },
        'Ana',
      ).error,
    ).toBe('Selecione uma categoria válida.')
  })

  it('usa autor padrão quando o nome não é informado', () => {
    const result = addTopic(
      createInitialForumState(),
      { title: 'Título', category: 'Dúvidas', message: 'Mensagem' },
      '   ',
      CREATED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.topics[result.state.topics.length - 1].author).toBe(
      'Usuário não identificado',
    )
  })

  it('calcula os indicadores do fórum', () => {
    const stats = getForumStats(createInitialForumState())

    expect(stats).toEqual({
      topics: 3,
      replies: 3,
      categories: 3,
      latestActivity: '2026-11-24T07:45:00.000Z',
    })
  })
})

describe('respostas do fórum', () => {
  it('adiciona uma resposta ao tópico com autor e data', () => {
    const initial = createInitialForumState()

    const result = addReply(
      initial,
      3,
      '  Posso cobrir a manhã de quinta.  ',
      'Carlos Eduardo Lima',
      REPLIED_AT,
    )

    expect(result.error).toBeNull()
    expect(result.state.topics.find((topic) => topic.id === 3)?.replies).toEqual([
      {
        id: 4,
        topicId: 3,
        author: 'Carlos Eduardo Lima',
        message: 'Posso cobrir a manhã de quinta.',
        createdAt: REPLIED_AT,
      },
    ])
    expect(initial.topics.find((topic) => topic.id === 3)?.replies).toEqual([])
  })

  it('rejeita resposta vazia', () => {
    const initial = createInitialForumState()

    const result = addReply(initial, 3, '   ', 'Carlos Eduardo Lima', REPLIED_AT)

    expect(result.error).toBe('Escreva uma resposta.')
    expect(result.state).toBe(initial)
  })

  it('rejeita resposta para tópico inexistente', () => {
    const initial = createInitialForumState()

    const result = addReply(initial, 999, 'Mensagem', 'Carlos Eduardo Lima', REPLIED_AT)

    expect(result.error).toBe('Tópico não encontrado.')
    expect(result.state).toBe(initial)
  })
})

describe('filtros e ordenação do fórum', () => {
  it('filtra os tópicos por categoria', () => {
    const initial = createInitialForumState()

    expect(filterTopics(initial.topics, 'Dúvidas')).toHaveLength(1)
    expect(filterTopics(initial.topics, 'Comunicados')).toHaveLength(1)
    expect(filterTopics(initial.topics, 'Todas')).toHaveLength(3)
  })

  it('ordena os tópicos pela atividade mais recente', () => {
    const initial = createInitialForumState()
    const created = addTopic(
      initial,
      { title: 'Tópico novo', category: 'Plantio e manejo', message: 'Mensagem' },
      'Ana Beatriz Costa',
      CREATED_AT,
    )

    expect(sortTopicsByActivity(created.state.topics)[0].title).toBe('Tópico novo')
    expect(getTopicLastActivity(initial.topics[0])).toBe('2026-11-21T08:40:00.000Z')
  })

  it('valida as categorias do fórum', () => {
    expect(isForumCategory('Mutirões')).toBe(true)
    expect(isForumCategory('Eventos')).toBe(false)
  })
})
