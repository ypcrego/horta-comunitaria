import type { ForumCategory, ForumReply, ForumState, ForumTopic } from '@/shared/types'
import { FORUM_CATEGORIES, INITIAL_FORUM_TOPICS } from '@/shared/constants'

export interface ForumOperationResult {
  state: ForumState
  error: string | null
}

export interface NewTopicInput {
  title: string
  category: ForumCategory
  message: string
}

export interface ForumStats {
  topics: number
  replies: number
  categories: number
  latestActivity: string | null
}

export function isForumCategory(value: unknown): value is ForumCategory {
  return FORUM_CATEGORIES.includes(value as ForumCategory)
}

export function createInitialForumState(): ForumState {
  return {
    topics: INITIAL_FORUM_TOPICS.map((topic) => ({
      ...topic,
      replies: topic.replies.map((reply) => ({ ...reply })),
    })),
  }
}

export function getTopicLastActivity(topic: ForumTopic): string {
  return topic.replies.reduce(
    (latest, reply) => (reply.createdAt > latest ? reply.createdAt : latest),
    topic.createdAt,
  )
}

export function sortTopicsByActivity(topics: ForumTopic[]): ForumTopic[] {
  return [...topics].sort((first, second) =>
    getTopicLastActivity(second).localeCompare(getTopicLastActivity(first)),
  )
}

export function filterTopics(
  topics: ForumTopic[],
  category: ForumCategory | 'Todas',
): ForumTopic[] {
  return category === 'Todas'
    ? topics
    : topics.filter((topic) => topic.category === category)
}

export function getForumStats(state: ForumState): ForumStats {
  const replies = state.topics.reduce((total, topic) => total + topic.replies.length, 0)
  const categories = new Set(state.topics.map((topic) => topic.category)).size
  const latestActivity = state.topics.reduce<string | null>((latest, topic) => {
    const activity = getTopicLastActivity(topic)
    return latest === null || activity > latest ? activity : latest
  }, null)

  return {
    topics: state.topics.length,
    replies,
    categories,
    latestActivity,
  }
}

function nextTopicId(topics: ForumTopic[]): number {
  return topics.reduce((max, topic) => Math.max(max, topic.id), 0) + 1
}

function nextReplyId(topics: ForumTopic[]): number {
  return (
    topics.reduce(
      (max, topic) => topic.replies.reduce((topicMax, reply) => Math.max(topicMax, reply.id), max),
      0,
    ) + 1
  )
}

export function addTopic(
  state: ForumState,
  input: NewTopicInput,
  author: string,
  createdAt: string = new Date().toISOString(),
): ForumOperationResult {
  const title = input.title.trim()
  if (!title) {
    return { state, error: 'Informe o título do tópico.' }
  }
  if (!isForumCategory(input.category)) {
    return { state, error: 'Selecione uma categoria válida.' }
  }

  const message = input.message.trim()
  if (!message) {
    return { state, error: 'Escreva a mensagem do tópico.' }
  }

  const topic: ForumTopic = {
    id: nextTopicId(state.topics),
    title,
    category: input.category,
    message,
    author: author.trim() || 'Usuário não identificado',
    createdAt,
    replies: [],
  }

  return {
    error: null,
    state: {
      topics: [...state.topics, topic],
    },
  }
}

export function addReply(
  state: ForumState,
  topicId: number,
  message: string,
  author: string,
  createdAt: string = new Date().toISOString(),
): ForumOperationResult {
  const topic = state.topics.find((candidate) => candidate.id === topicId)
  if (!topic) {
    return { state, error: 'Tópico não encontrado.' }
  }

  const trimmedMessage = message.trim()
  if (!trimmedMessage) {
    return { state, error: 'Escreva uma resposta.' }
  }

  const reply: ForumReply = {
    id: nextReplyId(state.topics),
    topicId,
    author: author.trim() || 'Usuário não identificado',
    message: trimmedMessage,
    createdAt,
  }

  return {
    error: null,
    state: {
      topics: state.topics.map((candidate) =>
        candidate.id === topicId
          ? { ...candidate, replies: [...candidate.replies, reply] }
          : candidate,
      ),
    },
  }
}
