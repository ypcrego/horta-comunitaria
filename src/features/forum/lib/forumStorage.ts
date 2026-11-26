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

export function isForumState(value: unknown): value is ForumState {
  if (!isRecord(value)) return false
  return Array.isArray(value.topics) && value.topics.every(isForumTopic)
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
