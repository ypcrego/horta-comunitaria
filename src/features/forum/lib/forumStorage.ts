import type { ForumReply, ForumState, ForumTopic } from '@/shared/types'
import { FORUM_STORAGE_KEY } from '@/shared/constants'
import { createInitialForumState, isForumCategory } from './forum'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isForumReply(value: unknown): value is ForumReply {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    isFiniteNumber(value.topicId) &&
    typeof value.author === 'string' &&
    typeof value.message === 'string' &&
    typeof value.createdAt === 'string'
  )
}

function isForumTopic(value: unknown): value is ForumTopic {
  if (!isRecord(value)) return false
  return (
    isFiniteNumber(value.id) &&
    typeof value.title === 'string' &&
    isForumCategory(value.category) &&
    typeof value.message === 'string' &&
    typeof value.author === 'string' &&
    typeof value.createdAt === 'string' &&
    Array.isArray(value.replies) &&
    value.replies.every(isForumReply)
  )
}

function hasValidForumIntegrity(state: ForumState): boolean {
  const topicIds = new Set<number>()
  const replyIds = new Set<number>()

  for (const topic of state.topics) {
    if (topicIds.has(topic.id)) return false
    topicIds.add(topic.id)

    for (const reply of topic.replies) {
      if (replyIds.has(reply.id) || reply.topicId !== topic.id) return false
      replyIds.add(reply.id)
    }
  }

  return true
}

export function isForumState(value: unknown): value is ForumState {
  if (!isRecord(value)) return false
  if (!Array.isArray(value.topics)) return false
  if (!value.topics.every(isForumTopic)) return false

  return hasValidForumIntegrity({ topics: value.topics })
}

export function loadForumState(): ForumState {
  if (typeof window === 'undefined') {
    return createInitialForumState()
  }

  try {
    const rawState = window.localStorage.getItem(FORUM_STORAGE_KEY)
    if (!rawState) return createInitialForumState()

    const parsed: unknown = JSON.parse(rawState)
    return isForumState(parsed) ? parsed : createInitialForumState()
  } catch {
    return createInitialForumState()
  }
}

export function saveForumState(state: ForumState): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearForumState(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(FORUM_STORAGE_KEY)
  } catch {
    // Ignora ambientes em que o localStorage não está disponível.
  }
}
