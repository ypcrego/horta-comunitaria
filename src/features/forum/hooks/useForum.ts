import { useRef, useState } from 'react'
import type { ForumState } from '@/shared/types'
import {
  addReply as addReplyToState,
  addTopic as addTopicToState,
  type NewTopicInput,
} from '../lib/forum'
import { loadForumState, saveForumState } from '../lib/forumStorage'

export function useForum() {
  const [state, setState] = useState<ForumState>(loadForumState)
  const stateRef = useRef(state)

  function commit(nextState: ForumState) {
    stateRef.current = nextState
    setState(nextState)
    saveForumState(nextState)
  }

  function createTopic(input: NewTopicInput, author: string): string | null {
    const result = addTopicToState(stateRef.current, input, author)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  function replyToTopic(topicId: number, message: string, author: string): string | null {
    const result = addReplyToState(stateRef.current, topicId, message, author)
    if (result.error) return result.error
    commit(result.state)
    return null
  }

  return {
    topics: state.topics,
    createTopic,
    replyToTopic,
  }
}
