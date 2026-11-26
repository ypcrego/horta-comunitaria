import { beforeEach, describe, expect, it } from 'vitest'
import { FORUM_STORAGE_KEY, INITIAL_FORUM_TOPICS } from '@/shared/constants'
import { addReply, addTopic, createInitialForumState } from './forum'
import {
  clearForumState,
  isForumState,
  loadForumState,
  saveForumState,
} from './forumStorage'

const CREATED_AT = '2026-11-25T12:00:00.000Z'
const REPLIED_AT = '2026-11-26T09:30:00.000Z'

describe('persistência do fórum em localStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('salva e restaura tópicos e respostas', () => {
    const initial = createInitialForumState()
    const created = addTopic(
      initial,
      {
        title: 'Oficina de compostagem',
        category: 'Mutirões',
        message: 'Encontro no sábado pela manhã.',
      },
      'Carlos Eduardo Lima',
      CREATED_AT,
    )
    const topicId = created.state.topics[created.state.topics.length - 1].id
    const replied = addReply(
      created.state,
      topicId,
      'Vou participar.',
      'Ana Beatriz Costa',
      REPLIED_AT,
    )

    expect(saveForumState(replied.state)).toBe(true)

    const restored = loadForumState()
    const topic = restored.topics.find((candidate) => candidate.id === topicId)
    expect(topic).toMatchObject({
      title: 'Oficina de compostagem',
      category: 'Mutirões',
      author: 'Carlos Eduardo Lima',
    })
    expect(topic?.replies).toHaveLength(1)
    expect(topic?.replies[0]).toMatchObject({
      author: 'Ana Beatriz Costa',
      message: 'Vou participar.',
      createdAt: REPLIED_AT,
    })
  })

  it('usa os tópicos iniciais quando ainda não há dados salvos', () => {
    const restored = loadForumState()

    expect(restored.topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
    expect(restored.topics[0]).toEqual(INITIAL_FORUM_TOPICS[0])
  })

  it('ignora dados corrompidos', () => {
    window.localStorage.setItem(FORUM_STORAGE_KEY, '{conteudo-invalido')

    const restored = loadForumState()

    expect(restored.topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
  })

  it('ignora um estado com formato inesperado', () => {
    const invalidState = { topics: [{ id: 'x' }] }
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(invalidState))

    expect(isForumState(invalidState)).toBe(false)
    expect(loadForumState().topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
  })

  it('rejeita tópicos com ids duplicados', () => {
    const state = createInitialForumState()
    const invalidState = {
      topics: [...state.topics, { ...state.topics[0] }],
    }
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(invalidState))

    expect(isForumState(invalidState)).toBe(false)
    expect(loadForumState().topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
  })

  it('rejeita resposta vinculada a outro tópico', () => {
    const state = createInitialForumState()
    const invalidState = {
      topics: state.topics.map((topic) =>
        topic.id === 1
          ? {
              ...topic,
              replies: topic.replies.map((reply, index) =>
                index === 0 ? { ...reply, topicId: 2 } : reply,
              ),
            }
          : topic,
      ),
    }
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(invalidState))

    expect(isForumState(invalidState)).toBe(false)
    expect(loadForumState().topics).toHaveLength(INITIAL_FORUM_TOPICS.length)
  })

  it('rejeita respostas com ids duplicados entre tópicos', () => {
    const state = createInitialForumState()
    const invalidState = {
      topics: state.topics.map((topic) =>
        topic.id === 2
          ? {
              ...topic,
              replies: [{ ...topic.replies[0], id: 1 }],
            }
          : topic,
      ),
    }
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(invalidState))

    expect(isForumState(invalidState)).toBe(false)
  })

  it('remove o estado salvo do localStorage', () => {
    saveForumState(createInitialForumState())
    expect(window.localStorage.getItem(FORUM_STORAGE_KEY)).not.toBeNull()

    clearForumState()

    expect(window.localStorage.getItem(FORUM_STORAGE_KEY)).toBeNull()
  })
})
